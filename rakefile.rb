require 'IIS_site_builder'
require 'IIS_apppool_builder'
require 'IIS_self_signer'
require 'IIS_host_adder'

SITENAME = "stubapi.7digital.local"

desc "build and deploy locally"
task :default => [:build,:deploy] do

end
task :build do
	`bundle install`
	`npm install`
end

desc "deploys the iis site locally"
task :deploy do |t, args|
	phyiscalPath = File.dirname(__FILE__).gsub("/", "\\")
	IISSiteBuilder.new(SITENAME, phyiscalPath).delete.create
	IISAppPoolBuilder.new(SITENAME).delete.create.assign
end