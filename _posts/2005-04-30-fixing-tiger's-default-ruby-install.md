---
layout: post
title: !binary |-
  Rml4aW5nIFRpZ2VyJ3MgRGVmYXVsdCBSdWJ5IEluc3RhbGw=
enki_id: 4488
---

The Ruby that ships with Mac OS X 10.4 (Tiger) is pleasantly current
but  
has an issue that prevents C extensions from compiling and installing  
properly. In case you’ve just upgraded and want to use the  
Apple-supplied Ruby, go install <a
href="http://rubygems.rubyforge.org">RubyGems</a> (as if you haven’t  
already!) and do:

            sudo gem install fixrbconfig
            sudo fixrbconfig

<p>
This will fix some settings in rbconfig.rb that you probably don’t  
care to fix by hand.

</p>
