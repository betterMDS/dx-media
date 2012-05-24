define([
	'dojo/sniff'
], function(has){

	var _version,
		getVersion = function(){
			if(has('ios')) return '0';

			if(_version) return _version;
			var v, plugin = navigator.plugins["Shockwave Flash"];
			if(plugin && plugin.description){
				v = plugin.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split(".");
			}else{
				var testVersion = 10, testObj = null;
				while(!testObj && testVersion > 7){
					try {
						testObj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + testVersion--);
					}catch(e){ }
				}
				if(testObj){
					v = testObj.GetVariable("$version").split(" ")[1].split(",");
				}
			}
			if(v){
				_version = {
					major: (v[0]!=null) ? parseInt(v[0]) : 0,
					minor: (v[1]!=null) ? parseInt(v[1]) : 0,
					rev: (v[2]!=null) ? parseInt(v[2]) : 0
				};
			}else{
				_version = { major: 0, minor: 0, rev: 0 };
			}
			_version.toString = function(){
				return this.major+"."+this.minor+"."+this.rev;
			}
			return _version;
		}

		_version = getVersion();

	return _version;

});
