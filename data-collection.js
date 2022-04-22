module.exports = function(RED) {
    function DataCollectionNode(config) {
        RED.nodes.createNode(this,config);
		const fs =  require('fs');
        var node = this;
		var mem_data = null;
		let tmpFile = "./tmp"
		let tmpID = this.id;
		let fileName = tmpFile.concat(tmpID, ".json");
		let safeSamples = 10;

		if(config.samples <= 10)
			safeSamples = 10;
		else
			safeSamples = config.samples;
		
        node.on('input', function(msg) {
			if(msg.topic === "trigger")
			{
				var newMsg = { payload: mem_data, topic: config.outtopic };
				node.send(newMsg);
			}
			else
			{
				if(mem_data !== null)
				{
					//var index = mem_data.length;
					if(mem_data.length >= safeSamples)
					{
						mem_data.shift();
						mem_data.push(msg.payload);
					}
					else
					{
						mem_data.push(msg.payload);
						//mem_data[index] = msg.payload;
					}
				}
				else
				{
					//Checking if temporary input file exists
					if(fs.existsSync(fileName))
					{
						//If so, we load the file to the memory array
						var text = fs.readFileSync(fileName).toString('utf-8');
						if(text !== null && text !== undefined)
						{
							mem_data = JSON.parse(text);
						}
					}
					else
					{
						var tmp_data = new Array();
						tmp_data[0] = msg.payload;
						mem_data = tmp_data;
					}
				}
				
				var newMsg = { payload: mem_data, topic: config.outtopic };
				node.send(newMsg);
				
				//Save on temp file
				fs.writeFile(fileName, JSON.stringify(mem_data), (err) => {
					if (err) {
						console.log(err);
						}});
			}
        });
    }
	
		
    RED.nodes.registerType("data-collection",DataCollectionNode);
}
