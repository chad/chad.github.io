---
layout: post
title: !binary |-
  Q29kZSBHZW5lcmF0aW9uIGlzIE5ldz8=
enki_id: 4524
---

<a href="http://www.codegeneration.net/lth/">Jack Herrington</a>, who
wrote  
the excellent
<a href="http://www.manning.com/herrington/index.html">Code  
Generation In Action</a>, has a couple of <a
href="http://today.java.net/pub/a/today/2004/05/12/generation1.html">newish</a>  
<a
href="http://today.java.net/pub/a/today/2004/05/31/generation-pt2.html">articles</a>  
up on <a href="http://java.net">java.net</a>.

<p>
I’ve linked to them here both because they’re well worth  
reading and learning from, and because there is something that has
been  
bothering me since I read a draft of Code Generation in Action. The
first  
line of Jack’s java.net article captures it. Here’s the full  
first paragraph for context:

</p>
      Code generation is a key new trend in engineering, one that you need to
      understand well.  The reason is simple: today's modern frameworks are
      extremely code-intensive. Using a code generator to build the code for
      you can save you a lot of time, both in writing the code and fixing the
      inevitable bugs that spring from swathes of hand-written code.

<p>
And, later in the article, Jack’s definition of code generation:

</p>
      Code generation is using one application to build code for
      another application.

<p>
So, code generation is the automation of code creation for the purpose
of  
reducing defects and increasing developer productivity. Defect reduction
is  
largely what inspired John Mauchly in 1949 to create <a
href="http://www.programcpp.com/Chapter02/2_2_1.html">“Short
Code”</a>,  
which had to be hand-compiled to machine code. Its purpose was to
allow  
developers to think at a higher level and to avoid the 1s and 0s of
machine  
code while programming. Afterward, <a
href="http://members.fortunecity.com/jonhays/Hopper.html">Grace
Hopper</a>  
took this to the next logical level, and in 1951, created the first  
compiler. Developers could think and write code at a higher level and
the  
computer would generate machine code for them. I’m no historian, but  
this appears to be the first concrete example of code generation. And,
even  
in 1951, its goals were the same as today: faster, less defect-ridden  
coding.

</p>
<p>
This is not all to say that there isn’t really something  
‘new’ going on now. I think what feels ‘new’ to  
Jack is that he and others have recognized that it’s time to shift a  
little further up the value chain (again). Java and .NET provide
suitable  
plumbing, but there’s no need to think at that low a level for many  
of today’s application development needs. <a
href="http://nakedobjects.org">Naked Objects</a> solves the problem in
a  
different way. Smalltalk and Ruby solve it in yet another way (you  
don’t see much code generation going on in the high-level, dynamic  
language world—incidentally, Jack’s book uses Ruby to generate  
Java code. Ruby is the high level language and Java is the "machine  
code&quot;).

</p>
<p>
I’d say this new trend in engineering is really just the natural  
progression of an ever-present trend in our industry’s evolution.  
Today’s high level, cutting-edge language, environment, or paradigm  
is tomorrow’s machine code. Jack’s right: code generation is  
important and you `do` need to understand it…unless you like  
being a plumber.

</p>
<p>
Update: <a
href="http://www.codegeneration.net/lth_archives/000229.html">Thanks,  
Jack</a>

</p>
