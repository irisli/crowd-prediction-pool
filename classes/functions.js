moment.timeSince = function(ts, raw){
	raw = typeof raw !== 'undefined' ? raw : false;

    now = moment();
    ts = moment(ts);
    var delta = now - ts;

    delta = delta/1000; //us to s
    
    if (raw) {
    	return delta;
    }

    var ps, pm, ph, pd, min, hou, sec, days;

    if(delta<=60){
        ps = (delta>1) ? "s": "";
        if (Math.round(delta) == 0) {
        	ps = "s";
        }
        
        return Math.round(delta)+" second"+ps
    }

    if(delta>=60 && delta<=3599.5){
        min = Math.floor(delta/60);
        sec = Math.round(delta-(min*60));
        pm = (min>1) ? "s": "";
        ps = (sec>1) ? "s": "";
        return min+" minute"+pm+" "+sec+" second"+ps;
    }

    if(delta>=3599.5 && delta<=86400){
        hou = Math.floor(delta/3600);
        min = Math.floor((delta-(hou*3600))/60);
        ph = (hou>1) ? "s": "";
        pm = (min>1) ? "s": "";
        return hou+" hour"+ph+" "+min+" minute"+pm;
    } 

    if(delta>=86400){
        days = Math.floor(delta/86400);
        hou =  Math.floor((delta-(days*86400))/3600);
        min = Math.floor((delta-(days*86400)-(hou*3600))/60);
        pd = (days>1) ? "s": "";
        ph = (hou>1) ? "s": "";
        pm = (min>1) ? "s": "";
        return days+" day"+pd+" "+hou+" hour"+ph+" "+min+" min"+ph;
    }
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// Pads a string with whitespace on the left
String.padLeft = function(input, numCharacters){
    var n = '' + input;
    var pad = n.length < numCharacters ? numCharacters-n.length : 0;
    return String(Array(numCharacters + 1).join(" ")).substr(0,pad) + n;
}

String.padRight = function(input, numCharacters){
    var n = '' + input;
    var pad = n.length < numCharacters ? numCharacters-n.length : 0;
    return n + String(Array(numCharacters + 1).join(" ")).substr(0,pad);
}