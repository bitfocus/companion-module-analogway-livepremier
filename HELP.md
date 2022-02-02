## Analog Way LivePremier Series module

This module allows you to control all models of Analog Way's LivePremier live image processing lineup.
It uses the LivePremier's REST API, so it is basically "fire and forget". That means the module just sends commands and doesn't care about execution or feedback. With the REST API system states could be polled from the system, but the traffic would be to much to continuously pull everything and keep in sync.
That means at this time no feedback is provided by the module. If you want to have bidirectional communication look for the LivePremier module using the AWJ API.

# Configuration

Just enter the IPv4 address and there you go. If you can't use TCP port 80 for the Aquilon (e.g. with the simulator) you can also optionally specify a port. IPv6 or hostname is not supported yet.
