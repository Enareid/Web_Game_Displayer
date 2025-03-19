import { networkInterfaces } from 'os';


export default class serverGestion {

    constructor(){
        this.address = null;
    }
    getAddress(){
        var
            // Local IP address that we're trying to calculate
            address
            // Provides a few basic operating-system related utility functions (built-in)
            // Network interfaces
            ,ifaces = networkInterfaces();


        // Iterate over interfaces ...
        for (var dev in ifaces) {

            // ... and find the one that matches the criteria
            var iface = ifaces[dev].filter(function(details) {
                return details.family === 'IPv4' && details.internal === false;
            });

            if(iface.length > 0)
                address = iface[0].address;
        }

        // Print the result
        console.log(address); // 10.25.10.147
        this.address = address;
    }

    returnAddress(){
        if(this.address == null){
            this.getAddress();
        }
        return this.address;
    }
}