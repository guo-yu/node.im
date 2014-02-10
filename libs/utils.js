exports.target = function(ip) {
    // '10.0.1.0/24'
    var ips = ip.split('.');
    ips[ips.length - 1] = 0;
    return ips.join('.') + '/24';
}