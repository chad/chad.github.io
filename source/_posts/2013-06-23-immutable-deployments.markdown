---
layout: post
title: "Trash Your Servers and Burn Your Code: Immutable Infrastructure and Disposable Components"
date: 2013-06-23 18:57
comments: true
categories:
---
As a developer and sometimes system adminstrator, one of the scariest things I ever encounter is a server that's been running for ages which has seen multiple upgrades of system and application software.

Why? Because an old system inevitably grows warts. They start as one-time hacks during outages. A quick edit to a config file saves the day. "We'll put it back into Chef later," we say, as we finally head off to sleep after a marathon fire fighting session.

Cron jobs spring up in unexpected places, running obscure but critical functions that only one person knows about. Application code is deployed outside of the normal straight-from-source-control process.

The system becomes finicky. It only accepts deploys in a certain manual way. The init scripts no longer work unless you do something special and unexpected.

And, of course the operating system has been patched again and again (in the best case) in line with the standard operating procedures, and the inevitable entropy sets in.  Or, worse, it has never been patched and now you're too afraid of what would happen if you try.

The system becomes a house of cards. You fear any change and you fear replacing it since you don't know everything about how it works.

We've tried lots of ways to avoid this problem over the years from team policy to automation.  We're trying a new one now <a href="http://wunderlist.com">at work</a>: Immutable Deployments.

Many of us in the software industry are starting to take notice of the benefits of immutability in software architecture.  We've seen an increased interest over the past few years in functional programming techniques with rising popularity of languages such as Erlang, Scala, Haskell, and Clojure.  Functional languages offer immutable data structures and single assignment variables. The claim (which many of us believe based on informal empirical evidence) is that immutability leads to programs tat are easier to reason about and harder to screw up.

So why not take this approach (where possible) with infrastructure? If you absolutely know a system has been created via automation and never changed since the moment of creation, most of the problems I describe above disappear. Need to upgrade? No problem. Build a new, upgraded system and throw the old one away.  New app revision? Same thing. Build a server (or image) with a new revision and throw away the old ones.

At <a href="http://6wunderkinder.com">6Wunderkinder</a>, we have been moving in this direction over the past 4 months.  It's giving us the confidence we need to rapidly iterate on our backend infrastructure as we continue to make things faster, more scalable and dependable for our customers and flexible to move our applications forward more freely.

Maybe more remarkable, though, is that like a new programming paradigm, thinking of infrastructure this way changes how I view our systems pretty fundamentally. New patterns and anti-patterns emerge. It is changing how I think not just about deployments but about application code (and even team structure).

This idea is a work in progress for me. We're obviously not the first ones to think of it, so there is a lot to learn.  It also implies some kind of "cloud" infrastructure, though I think modern software architecture generally does.

Expect to hear more about the tactical details of this from me here and <a href="http://railsisrael2013.events.co.il/presentations/852-disposable-components">at various conferences this year</a>.

