---
layout: post
title: !binary |-
  UnVieUdlbXMgMC4zLjAgLSBXaGF0J3MgbmV3
enki_id: 4476
---

This week, we released a new version of <a
href="http://rubygems.rubyforge.org">RubyGems</a>. We haven’t done  
very well with Open Source’s "Release Early—Release  
Often&quot; rule of thumb (on either count). But, we have added a lot
of  
new stuff. Because there are so many new features stacked up, we need a
lot  
of help putting this release through its paces. Specifically:

<h2>
Applications

</h2>
<p>
We’ve added the ability to install "applications&quot;. With the  
previous RubyGems release, you could install libraries, but if you had
an  
executable program included with your package, there was no direct
support  
for installing it. Now, you can do this:

</p>
      tashi-delek:~ chadfowler$ sudo gem -Ri rake
       Attempting remote installation of 'rake'
       Successfully installed rake version 0.3.2
      tashi-delek:~ chadfowler$ rake --version
       rake, version 0.3.2

<p>
Because RubyGems allows multiple versions of the same package to
co-exist,  
we auto-generate an executable script that points to the real location
of  
the script (in the gems directory). It looks like this for now:

</p>
      require 'rubygems'
      require_gem 'rake', &quot;0.3.2&quot;
      load 'rake'

<p>
I’ve been considering adding an option that would allow the  
"0.3.2&quot; part to be overridable, so you could do something like:

</p>
      rake --gem-version 0.3.1

<p>
I’m not sure about that yet.

</p>
<h2>
Binary Gems

</h2>
<p>
The previous release of RubyGems only supported installation of either
pure  
Ruby gems or pre-compiled, platform-dependent gems (e.g. x86 Linux  
XMLParser). We recognize the need for two things: 1) Installation of  
extensions from source and 2) "intelligent&quot; selection of  
precompiled gems in the remote installation process. <a
href="http://richkilmer.blogs.com/ether/">Rich</a> took a stab at the
first  
of these. A gemspec can now contain a reference to one or more
extconf.rb  
scripts, which will be run (to generate a Makefile), followed by a  
‘make install’:

</p>
      spec.extensions &lt;&lt; &quot;ext/mygem/extconf.rb&quot;

<p>
We’ve tested this one with an RDF/OWL library that Rich is working on  
as well as with
<a href="http://rubyforge.org/projects/ripper">Ripper</a>.  
We could use help testing it and (probably) making it work on Windows.
It  
seems like this would be a fragile area, so the more gems we see and
test,  
the better. If you’ve got a Ruby/C extension—especially if it  
does something unusual—please consider making a gem of it and sending  
it in.

</p>
<h2>
Gem Testing

</h2>
<p>
If you’ve got unit tests for your library or application, you can  
include them in your gem spec, and users will have the option of
running  
them at install time. If tests fail, RubyGems will ask the user if
they  
would like to keep the software or remove it. You specify a test suite
by  
adding a pointer to a file that references all of your tests to the
gem  
specification:

</p>
       spec.test_suite_file = &quot;test/all_tests.rb&quot;

<p>
Then when you run

</p>
       gem -Ri my-well-tested-lib --run-tests

<p>
the RubyGems system will download, install, and run the library’s  
tests.

</p>
<h2>
Library Stubs

</h2>
<p>
Typically, to use a gem, you have to do something like this:

</p>
      require 'rubygems'
      require_gem &quot;somegem&quot;, &quot;&gt;= 1.0.0&quot; # version spec is optional

<p>
This will load the RubyGems library and then add `somgem` to the  
LOAD\_PATH and load whatever libary is listed as the gem’s  
"autorequire&quot;. So, in most cases, these two lines will load  
everything you need in order to use an external library.

</p>
<p>
There have been various hacks and work-arounds suggested to avoid having
to  
1) require the RubyGems library and 2) use the special  
"require\_gem&quot; as opposed to a normal "require&quot;. Gavin  
Sinclair went ahead and implemented one of them, installing a library
stub  
(similar to the application stub mentioned above) into Ruby’s  
"site\_ruby&quot; directory. So, if your gem’s autorequire is  
"rss/rss.rb&quot;, it will be possible to

</p>
       require 'rss/rss'

<p>
and a stub library will load RubyGems and use "require\_gem&quot; to  
load the "rss&quot; library. The behavior is optional and turned off  
by default in the current CVS (left it on for the 0.3.0 release). To  
install a library with the stub, you just do:

</p>
       tashi-delek:~ chadfowler$ gem -Ri rubyzip --install-stub

       tashi-delek:~ chadfowler$ ruby -e 'puts require &quot;zip/zip&quot;'
       true

<p>
Of all the hacks and work-arounds, I think I like this one the best,  
because it actually installs a real file that gets require’d instead  
of replacing Ruby’s require at runtime. Having said that, though I  
like it better than the other ways, I’m still not sure if I like it.  
Time will tell. I’d be interested in hearing reactions from users.

</p>
<h2>
Config/Preferences File

</h2>
<p>
Gavin also created a simple config file option for the "gem&quot;  
command. It looks by default for \~/.gemrc, though it can be overridden
by  
the "—config-file&quot; option of the "gem&quot; command.

</p>
<p>
The config file is in <a href="http://www.yaml.org">YAML</a> format
with,  
at the time, only two options. It looks something like this:

</p>
       gem: --gen-rdoc --run-tests
       rdoc: --template kilmer

<p>
This config file will cause "—gen-rdoc&quot; and  
"—run-tests&quot; to be prepended to all invocations of the  
"gem&quot; command and will cause the "kilmer&quot; template to  
be used when generating rdoc documents. This is a good way to make  
non-default behavior the default for you. Someone was asking on irc
that,  
for example, —gen-rdoc be on by default. There was an informal vote  
showing that only one person wanted this feature to be on by default.  
Fortunately for him, .gemrc can do that.

</p>
<h2>
Library Versioning

</h2>
<p>
There has been a lot of discussion around library versioning between
these  
releases. We haven’t actually done anything about it, and I have to  
admit that it’s making me tired. <a
href="http://rubyforge.org/pipermail/rubygems-developers/2004-April/000267.html">Here</a>  
and <a
href="http://rubyforge.org/pipermail/rubygems-developers/2004-April/000294.html">here</a>  
are good places to start if you’d like to take a peek into the  
debate. It centers around how to deal with API-level incompatibilities
in  
libraries. There are four leading solutions, none of which are really
all  
that great:

</p>
<ul>
<li>
Introduce a new API version number which is unrelated to the gem
version  
number

</li>
<li>
Make the gem version number have some implicit meanings, the worst of
which  
is that "&gt; 1.0&quot; would implicitly mean "&lt; 2.0&quot;.  
This one <b>really</b> bothers me. "Greater than one&quot;  
shouldn’t implicitly mean "less than two&quot;.

</li>
<li>
Add the ability to specify a version dependency that looks like  
"1.**.**" (any version in the "1&quot; family)

</li>
<li>
Ignore the issue until it becomes an actual problem. It probably  
won’t be hard to get around anyway.

</li>
</ul>
<p>
So far, I’ve personally been doing the latter. I’m sure there  
will come a time when something needs to be done about this, but I  
don’t think the sky is falling just yet. Someone probably need to  
spend a day or so looking through similar systems to see how it’s  
done.

</p>
<hr size="1">
</hr>
<p>
It’s interesting to work on a project that you hope <b>everyone</b>  
in your "community&quot; will use while also being a user yourself. If  
I were doing an editor or a piece of weblog software, I could just
make  
decisions based on how <b>I</b> would like to use it. But since we’re  
trying to create software to pervade throughout the Ruby community, we
have  
to do things (sort of) by committee. It’s much harder to justify a  
unilateral decision, which creates a different tone during development.

</p>
<p>
RubyGems is an interesting project, because it’s <b>useless</b>  
unless it becomes the standard.

</p>
<p>
So, Ruby programmers, please download <a
href="http://rubyforge.org/frs/download.php/600/rubygems-0.3.0.tar.gz">RubyGems  
0.3.0</a> and install it. Install some gems and use them, and then <a
href="http://rubygems.rubyforge.org/wiki/wiki.pl?CreateAGemInTenMinutes">make  
gems</a> of your own libraries and send them in. If you don’t have  
libraries to make gems of, make some gems out of other people’s  
libraries and send the gemspecs to the authors. Ruby <b>needs</b> a  
standardized package management system. This problem is 20% technical
and  
80% social. Every little bit can help.

</p>
