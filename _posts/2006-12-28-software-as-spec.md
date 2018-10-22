---
layout: post
title: !binary |-
  U29mdHdhcmUgYXMgU3BlYw==
enki_id: 4471
---

(This article is part of the <a
href="http://chadfowler.com/2006/12/27/the-big-rewrite">Big  
Rewrite</a> series.)

<p>
"Make it do what it already does." That’s a tempting and  
simple way to view software requirements on a rewrite project. After
all,  
the system already exists. The question of "what should it do  
when…" can presumably always be answered with: "what it  
already does&quot;.

</p>
<p>
There are two major problems with this assumption. The first, and most  
disruptive, is that the programmers don’t know what questions to ask.  
This is especially true if the programmers weren’t the original  
developers of the system (most often the case on a major technology
shift),  
but even a programmer who did the original implementation of a product  
won’t remember every nook, cranny, and edge case. What’s worse,  
with the fragile safety net of an existing implementation, programmers
can  
easily oversimplify the interface, and <em>assume</em> they know the  
capabilities of the system. If a combination of drop-down selections  
results in a whole new corner of the system, how are they to know
without  
stumbling onto it (or performing an exhaustive and expensive test
cycle)?

</p>
<p>
If the software you’ve built is complex enough that it <em>needs</em>  
to be rewritten, it’s probably also so complex that it’s not  
discoverable in this way. This means that domain experts are going to
have  
to be heavily involved. It means that requirements are going to need to
be  
communicated in much the same way they are on a green-field project. And
it  
means that, unless it’s only used as a supplement, the existing  
system is more a liability to the rewrite than an asset.

</p>
<p>
Optimistic programmers might think I’ve missed something important  
here. If you’re rewriting a system, you’ve already got the  
code. The <em>code</em> can serve as the spec, right? Probably not.

</p>
<p>
Based on my own experiences and conversations with thousands of
software  
developers around the planet, I unscientifically conclude that almost
all  
production software is in such bad shape that it would be nearly useless
as  
a guide to re-implementing itself. Now take this already bad picture,
and  
extract only those products that are big, complex, and fragile enough
to  
need a major rewrite, and the odds of success with this approach are  
significantly worse.

</p>
<p>
Existing code is good for discovering algorithms—not complex,  
multistep processes.

</p>
