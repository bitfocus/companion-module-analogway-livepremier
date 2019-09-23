## Analog Way LivePremier Series module

This module allows you to control all models of Analog Way's LivePremier live image processing lineup.
At this time it uses the LivePremier's REST API, so it is basically "fire and forget". That means the module just sends commands and doesn't care about execution or feedback. With the REST API system states could be polled from the system, but the traffic would be to much to continuously pull everything and keep in sync.
That means at this time no feedback is provided by the module. The module will be upgraded when Analog Way releases the announced advanced API.

# Configuration

Just enter the IPv4 address and there you go. IPv6 or hostname is not supported yet.
