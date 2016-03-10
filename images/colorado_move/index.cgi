#!/usr/local/bin/ruby
puts "Content-type: text/html"
puts
puts "<html><body>"

Dir["*jpg"].entries.each do |jpg|
  puts "<img src=\"/images/colorado_move/#{jpg}\"><br>"
end

puts "</body></html>"
