#!/usr/local/bin/ruby
puts "Content-type: text/html"
puts
puts "<h1>Travel Pics</h1>"
Dir['*jpg'].each do |file|
  puts "<a href='#{file}'>#{file}</a><br>"
end
