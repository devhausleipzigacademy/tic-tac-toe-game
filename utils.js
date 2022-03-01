function mod(n, m) {
    return ((n % m) + m) % m;
}

function randomNumber(range) {
    return Math.floor( (Math.random()*range) );
}

function randomCoordinate(xRange, yRange){
    return [randomNumber(xRange), randomNumber(yRange)];
}