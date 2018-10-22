---
layout: post
title: !binary |-
  QSBCZXR0ZXIgT29rCg==
enki_id: 4540
---

You may have seen my Ruby-based Ook/Bf interpreter, linked from this
page.  
Yesterday, I happened upon the following (also Ruby-based) Bf
interpreter  
on &lt;a href="<a
href="http://www.cs.auc.dk/~larsch/ruby/">this“&gt;www.cs.auc.dk/\~larsch/ruby/”&gt;this</a>  
disturbed gentleman’s site&lt;/a&gt;. I’m at a loss for words.  
:)

<p>
&lt;PRE&gt;  
a=’p=0;t=""\*30000;’;$&lt;.each\_byte{\|c\|a&lt;&lt;({?&gt;=&gt;"p<span
class="underline"><span
style="text-align:center;">1;",?&lt;=&gt;"p-=1;",?</span></span>=&gt;  
"t\[p\]+=1;",?~~<span
style="text-align:center;">&gt;"t\[p\]</span>~~=1;",?\[=&gt;"while  
t\[p\]&gt;0;",?\]=&gt;"end;",?.=&gt;"putc t\[p\];",  
?,=&gt;"<a
href="http://c">t\[p\]=STDIN.getc\|\|0;“}</a>\|\|”")};eval a  
&lt;/PRE&gt;

</p>
