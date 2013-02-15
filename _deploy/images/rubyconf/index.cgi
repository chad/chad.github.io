#!/usr/local/bin/ruby
puts "Content-type: text/html"
puts
puts "<html><body>"
puts "<h2>tail -f /rubycentral/conference/2003</h2>"

Dir["*jpg"].entries.each do |jpg|
  puts "<img src=\"/images/rubyconf/#{jpg}\"><br>"
end

puts "</body></html>"
