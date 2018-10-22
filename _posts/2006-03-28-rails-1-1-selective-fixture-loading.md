---
layout: post
title: !binary |-
  UmFpbHMgMS4xOiBTZWxlY3RpdmUgRml4dHVyZSBMb2FkaW5n
enki_id: 4518
---

Rails 1.1 introduces greater than <a
href="http://weblog.rubyonrails.org/articles/2006/03/28/rails-1-1-rjs-active-record-respond_to-integration-tests-and-500-other-things">500  
enhancements and fixes</a>. Here’s one of the more obscure ones that  
you may not hear about otherwise. I was able to slip a trivial (one
line)  
patch in just under the wire for Rails 1.1 before it went out
yesterday.  
Now you can do this:

      rake db:fixtures:load FIXTURES=people

<p>
or multiple:

</p>
      rake db:fixtures:load FIXTURES=people,surveys

<p>
Not a big deal for the average Rails developer, but when you’ve got  
150+ models and 6.5MB of fixtures like
<a href="http://naviance.com">we  
do</a> it makes a big difference.

</p>
