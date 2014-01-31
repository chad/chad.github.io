---
layout: post
title: "The Magic of strace"
date: 2014-01-26 16:05
comments: true
categories:
---
Early in my career, a co-worker and I were flown from Memphis to Orlando to try to help end a multi-day outage of our company's corporate Lotus Domino server. The team in Orlando had been fire-fighting for days and had gotten nowhere. I'm not sure why they thought my co-worker and I could help. We didn't know anything at all about Lotus Domino. But it ran on UNIX and we were pretty good with UNIX. I guess they were desperate.

Lotus Domino was a closed-source black box of a "groupware" server. I can't remember the exact problem, but it had something to do with files not being properly accessible in its database, and apparently even the escalated support from Lotus was unable to solve the problem.

This was one of the most profoundly educational experiences of my career.  It's when I learned what may be for me the most important UNIX tool to date: strace.*

Nowadays I probably use strace or some equivalent almost every day I work as a programmer and/or systems engineer.  In this post I'll explain why and how and hopefully show you some tips on how to get the most out of this powerful little tool.

## What is strace?

strace is a command line tool which lets you trace the system calls and signals received by a given process and its children.  You can either use it to start a program or you can attach to an existing program to trace the calls the program makes to the system.  Let's look at a quick example. Say we have a simple C program like this:

<script src="https://gist.github.com/chad/90ffec34a0dff7ba3c52.js"></script>

It doesn't do much. It just prints "Hi" to the screen".  After compiling the program, we can run it with strace to see all of the system calls the program makes:

<script src="https://gist.github.com/chad/b9b19b0e4f3f6492008b.js"></script>

To start the program, we invoke strace and pass the program name (and any parameters we want to pass to the program).  In this case we also passed the "-s" flag to strace telling it the maximum string size we want it to print. This is helpful for showing expanded function arguments. Here we pass 2000, which is abitrarily "enough" to see everything we need to see in this program.  The default is 32, which in my experience means we'll almost definitely miss information we care about in the trace. We also use the "-f" flag, which tells strace to follow any children of the program we execute. In this case there are no children, but when using strace regularly it's probably good to get into a habit of following a process's children so you can see everything that happens when you execute the program.

After the invocation, we see a rather verbose log of every system call. To some (most?), this might look like gibberish. But, even if you have almost _no_ idea what you're looking at, you can quickly spot some useful pieces of information.

The first line of the trace shows a call to execve(). Unsurprisingly, execve()'s job is to run a program. It accepts the path to the program, any arguments as an array, and a list of environment variables to set for the program (which are ommitted from the output since they'd be so noisey).

The last two lines contain another recognizable sequence. First you see a call to write() with our C program's string "hi\n". The first argument to write() is the file descriptor to write to. In this case it's "1", which is the process's standard output stream. After the write call (which looks garbled because the actual write to standard out showed up along with the strace output), the program calls exit_group().  This function acts like exit() but exits all threads in a process.

What are all these calls between execve() and write()?  They take care of connecting all of the standard C libraries before the main program starts. They basically set up the runtime.  If you look at them carefully you'll see that they walk through a series of possible files, check to see if they are accessible, open them, map them into a memory location, and close them.

An important hint: every one of these functions is documented and available to read about using man pages. If you don't know what mmap() does, just type "man mmap" and find out.

Try running through every function in this strace output and learn what each line does.  It's easier than it looks!


## Tracing a running, real-world process

Most of the time when I need a tool like strace, it's because there's a process that's already running but not acting right. Under normal circumstances these processes can be extremely hard to troubleshoot since they tend to be started by the init system, so you can only use logs and other external indicators to inspect them.

strace makes it easy to look at the inner workings of an already running process. Let's say we have a problem with Ruby unicorn processes crashing in production and we're unable to see anything useful in the process's logs.  We can connect to the process using strace's "-p" flag.  Since a real production web service is likely to generate a lot of activity, we'll also use the "-o" flag to have strace send its output to a log file:

<script src="https://gist.github.com/chad/e8264dfdebfe6533c60e.js"></script>

After only a few seconds, this log file has about 9000 lines. Here's a portion of it that contains some potentially interesting snippets:

<script src="https://gist.github.com/chad/0c667b459b0b80aa83ea.js"></script>

We won't go through every line, but let's look at the first one. It's a call to select().  Programs use select() to monitor file descriptors on a system for activity. According to the select() man page, its second argument is a list of file descriptors to watch for read activity. select() will block for a configurable period of time waiting for activity on the supplied file descriptors, after which it returns with the number of descriptors on which activity took place.

Ignoring the other parameters for now, we can see that this call to select() watches file descriptors 14 and 15 for read activity and (on the far right of the trace output) returns with the value "1". strace adds extra info to some system calls, so we can see not only the raw result here but also which file descriptor had activity (14). Sometimes we just want the raw return value of a system call. To get this, you can pass an extra flag to strace: "-e raw=select". This tells strace to show raw data for calls to select().

So, what are file descriptors 14 and 15? Without that info this isn't very useful.  Let's use the lsof command to find out:

<script src="https://gist.github.com/chad/e92956d76dcd8f531bc2.js"></script>

In the 4th column of lsof's output, labeled "FD", we can see the file descriptor numbers for the program.  Aha! 14 and 15 are the TCP and UNIX socket ports that Unicorn is listening on.  It makes sense, then, that the process would be using select() to wait for activity.  And in this case we got some traffic on the UNIX socket (file descriptor 14).

Next, we see a series of calls which try to accept the incoming connection on the UNIX socket but return with EAGAIN. This normal behavior in a multi-processing network server. The process goes back and waits for more incoming data and tries again.

Finally, a call to accept4() returns a file descriptor (13) with no error. It's time to process a request! First the process checks info on the file descriptor using fstat(). The second argument to fstat() is a "stat" struct which the function fills with data. Here you can see mode (S_IFSOCK) and the size (which shows 0 since this isn't a regular file). After presumably seeing that all is as expected with the socket's file descriptor, the process receives data from the socket using recvfrom().

### Here's where things get interesting

Like fstat(), recvfrom()'s first parameter is the file descriptor to receive data from and its second is a buffer to fill with that data.  Here's where things get really interesting when you're trying to debug a problem: You can see the full HTTP request that has been sent to this web server process! This can be _extremely_ helpful when you're trying to troubleshoot a process you don't have much control over. The return value of the recvfrom() call indicates the number of bytes received by the call (167). Now it's time to respond.

The process first uses ppoll to ask the system to tell it when it would be OK to write to this socket.  ppoll() takes a list of file descriptors and events to poll for. In this case the process has asked to be notified when writing to the socket would not block (POLLOUT). After being notified, it writes the beginning of the HTTP response header using write().

Next we can see the Unicorn process's internal routing behavior at work. It uses stat() to see if there is a physical file on the file system which it could serve at the requested address. stat() returns ENOENT, indicating no file at that path, so the process continues executing code.  This is the typical behavior for static file-based caching on Rails systems. First look for a static file that would satisfy the request, then move on to executing code.

As a final glimpse into the workings of this particular process, we see a SQL query being sent to file descriptor 16. Reviewing our lsof output above, we can see that file descriptor 16 is a TCP connection to another host on that host's postgresql port (this number to name mapping is configured in /etc/services in case you're curious). THe process uses sendto() to send the formatted SQL query to the postgresql server. The third argument is the message's size and the fourth is a flag--MSG_NOSIGNAL in this case--which tells the operating system not to interrupt it with a SIGPIPE signal if there is a problem with the remote connection.

The process then uses the poll() function to wait for either read or error activity on the socket and, on receiving read activity, receives the postgresql server's response using recvfrom().

We skipped over a few details here, but hopefully you can see how with a combination of strace, lsof, and system man pages it's possible to understand the details of what a program is doing under the covers.

## What's "normal"?

Sometimes we just want to get an overview of what a process is doing. I first remember having this need when troubleshooting a broken off the shelf supply chain management application written in "Enterprise Java" in the late 90s.  It worked for some time and then suddenly under some unknown circumstance at a specific time of day it would start refusing connections. We had no source code, and we suffered from the typical level of quality you get from an enterprise support contract (i.e. we solved all problems ourselves).  So I decided to try to compare "normal" behavior with the behavior when things went wrong.

I did this by regularly sampling system call activities for the processes and then compared those normal samples with the activity when the process was in trouble. I don't remember the exact outcome that time, but it's a trick I've used ever since.  Until recently I would always write scripts to run strace, capture the output, and parse it into an aggregate. Then I discovered that strace can do this for me.

Let's take a look at a unicorn process again:

<script src="https://gist.github.com/chad/3572ead0ee4419aa56d0.js"></script>

Here we use the "-c" flag to tell strace to count the system calls it observes. When running strace with the "-c" flag, we have to let it run for the desired amount of time and then interrupt the process (ctrl-c) to see the accumulated data. The output is pretty self-explanatory.

I'm currently writing at 7am about a system that is used during working hours, so the unicorn process I'm tracing is mostly inactive. If you read through the previous trace, you shouldn't be surprised by the data.  Unicorn spent most of its time in select().  We know now that it uses select() to wait for incoming connections. So, this process spent almost all of its time waiting for someone to ask it to do something. Makes sense.

We can also see that accept4() returned a relatively high number of errors. As we saw in the above example, accept4() will routinely receive the EAGAIN error and go back into the select() call to wait for another connection.

The resulting function list is also a nice to-to list you could use to brush up on your C system calls.  [Add them to your to-do list](http://wunderlist.com) and go through and read about one per day until you understand each of them. If you do this, the next time you're tracing a Unicorn process under duress in production you'll be much more fluent in its language of system calls.

## Finding out what's slow

We'll wrap up by looking at how strace can help us determine the cause of performance problems in our systems. We recently used this at work to uncover one of those really gremlin-like problems where random, seemingly unrelated components of our distributed system degraded in performance and we had no idea why.  One of our databases slowed down. Some of our web requests slowed down. And finally, using sudo got slow.

That was what finally gave us a clue. We used strace to trace the execution of sudo and to time each system call sudo made. We finally discovered that the slowness was in a log statement! We had apparently misconfigured a syslog server without realizing it and all of the processes which were talking to that server had mysteriously slowed down.

Let's take a look at a simple example of using strace to track down performance problems in processes. Imagine we had a program with the following C source and we wanted to figure out why it takes over 2 seconds to execute:

<script src="https://gist.github.com/chad/4ce21f2a71c33ef35e02.js"></script>

Glancing through the code, there's nothing obvious that sticks out (heh), so we'll turn to strace for the answer. We use strace's "-T" flag to ask it to time the execution of each system call during tracing.  Here's the output:

<script src="https://gist.github.com/chad/1a3a9cff317103b155fe.js"></script>

As you can see, strace has included a final column with the execution time (in seconds) for each traced call. Following the trace line by line, we see that almost every call was incredibly fast until we finally reach a call that took more than 2 seconds!  Mystery solved.  Apparently something in our programming is calling nanosleep() with an argument of 2 seconds.

In a real-world trace with a lot more output we could save the data to a file, sort through it on the last column, and track down the offending function calls.

## There's more!

strace is an amazingly rich tool.  I've only covered a few of the options that I use most frequently, but it can do a lot more.  Check out the strace man page to browse some of the other ways you can manipulate its behavior.  Especially be sure to look at the uses of "-e", which accepts expressions allowing you to filter traces or change how traces are done.

If you read through this far and you didn't know what all these function calls meant, don't be alarmed. Neither did I at some point. I learned most of this stuff by tracing broken programs and reading man pages. If you program in a UNIX environment, I encourage you to pick a program you care about and strace its execution. Learn what's happening at the system level. Read the man pages. Explore. It's fun and you'll understand your own work even better than before.

----

* Actually I'm simplifying a bit. We were on Solaris, and the equivalent tool there was truss. It's basically the same. You get the point.

