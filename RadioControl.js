var buffertools = require('buffertools');
WritableBufferStream = buffertools.WritableBufferStream;
var http = require('http');
var sys = require("util"), repl = require("repl");
var boomzbox = require('./BoomzBox')
  , radio = boomzbox.connect('/dev/ttyUSB0')
  , express=require('express'),
    app = express.createServer();
  ;

/*
 * This is static! Bad code. should be dynamic
 */
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/tune', function(req, res){
  //setting pin mode here because i could not get it to work when setting it up top
  setTimeout(function() { radio.tune('92.9'); } , 2000);	
  res.send("Car is on 92.9!");
});
//	require('url').parse(req.url);
//res.end(JSON.stringify(require('url').parse(req.url)));
console.log("starting up");
app.listen(3000);
//startup settings
            m_responseWaitCount = 0;
            m_waitingOnResponse = false;
            //m_port.BaudRate = 19200;
            //m_port.ReadTimeout = 5000;
            //m_port.ReceivedBytesThreshold = 5;
            //m_port.DtrEnable = true;
            radio.m_devicePowered = true;
            var first = false;
            var start = 0;
            var end = 0;
	    var Encoding = 'ascii';
	    var timeOut = 500; // half a second spacing between all commands 

	    var buf = new Array();
	    var m_port = radio.m_port;

        try
        {
            //nextQueue();   
            //m_statusTimer = new System.Threading.Timer(new TimerCallback(statusTimerCallback), null, 1000, 1000)
	   //lets run through the thread every 200ms or so
		m_port.on("data", function (data) {
	          // console.log("buffer is " + 0 + " and = " + data.toHex());
		    //console.log(","+data.toHex());
		    if(buf.length > 39) {
			console.log("buffer is big.."+buf);
			res = doWork();
			console.log("Result was " + res);
			buf = new Array();
		    } else {
                      var arry = data.toHex().split("");
		      for(i=0; i < arry.length; i=i+2) {
		        if (buf.length < 40)
                        {
			  buf.push(arry[i]+arry[i+1]);
                        }
		      }
		   }	            
	        });
		//setInterval(function() {
	} catch (ex)
        {
            Error(ex.Message);
            if (m_port.IsOpen)
            {
                //m_port.DtrEnable = false;
                m_port.Close();
            }
        }
        function doWork() { 
               first = true;
               start = 0;
               end = 0;
               byteList = new Array();
               for (i = 0; i < buf.length - 1; i++)
                {
                    if ((buf[i] == '5a') && (buf[i + 1] == 'a5'))
                    {
                        if (first)
                        {
                            start = i;
                            first = false;
			    console.log("I'm starting the buffer with start " + start );
                        }
                        else
                        {
                            end = i;
			    console.log("I'm ending the buffer with start "+start+" and end "+end);
			    i = buf.length;
                        }
                    }
                }
		if(start == 0 && end == 0) {
		  buf = new Array();
		  return false;
	        }
		for(i = 0; i < (end-start);i++) {
		   byteList.push(buf[start+i]);
		}

		console.log("bytes look like .." + byteList);
                //for (i = 0; i < byteList.length; i++)
                //{
                    switch (byteList[4])
                    {
                        case 'f1': //Status message
                            {
                                //ushort freq = BitConverter.ToUInt16(byteList[i],6);
                                freq = ((byteList[i][6] << 8) + byteList[i][7]);
                                if (radio.m_currentFreq != freq)
                                {
                                    //We've got a frequency change!
                                    radio.m_currentFreq = freq;
                                    radio.m_currentChannel = new RadioChannel(freq);
                                }

                                msg = byteList[i].toString(Encoding, 11, byteList[i].Length - 12);
                                if (msg != "")
                                {
                                }
                                if (byteList[i][8] == 1)
                                {
                                    //HD Signal!
                                    radio.m_currentChannel.m_HDChannels = 0;
                                    //numChans = 0;
                                    //selectedHdChannel = byteList[i][9];
                                    radio.m_currentChannel.m_currentHDChannel = byteList[i][9];

                                    //strength = byteList[i][11];
                                    hdChans = byteList[i][10];

                                    for (j = 0; j < 8; j++)
                                    {
                                        if (((hdChans >> j) & 1) == 1)
                                        {
                                            radio.m_currentChannel.m_HDChannels++;
                                        }
                                    }

                                    if (!m_HDLock)
                                    {
                                        m_HDLock = true;
                                    }
                                    radio.m_currentChannel.m_callSign = msg.replace("\0", "");
                                    console.log(freq + " is " + radio.m_currentChannel.m_callSign);
                                    console.log("Locked to HD");
                                }
                                else
                                {
                                    radio.m_HDLock = false;
                                    //this.Text = "HD Inactive";
                                    console.log(freq + " is " + msg.replace("\0", ""))
                                    console.log("NOT Locked to HD");
                                }
                                break;
                            }
                        case 'f2': //RDS
                            {
                                if (!radio.m_HDLock)
                                {
                                    radioText = byteList[i].toString(Encoding, 5, 40).replace("\0", " ");
                                    programService = byteList[i].toString(Encoding, 40, 40).replace("\0", " ");
                                    radio.m_currentChannel.m_RDSRadioText = radioText;
                                    radio.m_currentChannel.m_RDSProgramService = programService;
                                    console.log("RDSInfo: " + radioText + " / " + programService);
                                }
                                else
                                {
                                    radioText = byteList[i].toString(Encoding, 5, 40).replace("\0", " ");
                                    programService = byteList[i].toString(Encoding, 40, 40).replace("\0", " ");
				    console.log("HDInfo: " + radioText + " / " + programService + radio.m_currentChannel.m_currentHDChannel + " / " + radio.m_currentChannel.m_HDChannels);
                                }
                                break;
                            }
                        case 'f3': //Power on notice.
                            {
                                if (radio.m_deviceInitialized)
                                {
				    console.log("Already started up");
                                    break;
                                } else {
				    console.log("Startup detected");
                                    m_waitingOnResponse = false;
                                    m_responseWaitCount = 0;
			            setTimeout(function() { radio.setFunction(radio.Command.Mute,[1]); } , 1000);	
			            setTimeout(function() { radio.setFunction(radio.Command.Volume,[0]); } , 1000);	
			            setTimeout(function() { radio.setFunction(radio.Command.Antenna,[1]); } , 1000);	
			            setTimeout(function() { radio.setFunction(radio.Command.AutoMessage,[1, 1, 1, 1, 1, 1]); } , 1000);	
			            setTimeout(function() { radio.setFunction(radio.Command.Mute,[0]); } , 1000);	
			            setTimeout(function() { radio.setFunction(radio.Command.Volume,[70]); } , 1000);
                                    //nextQueue();
				    radio.m_deviceInitialized = true;
				    break;
				}
                                break;
                            }
                        case 'f5':
                            {
                                msg = byteList[i].toString(Encoding);
				console.log(msg);                                
				break;
                            }
                        case 'f6': //Tuning status message
                            {
                                radio.m_currentChannel.m_HDSignalStrength = byteList[i][6];
                                break;
                            }
                        case 'ff':
                            {
                                if (byteList[i][5] == 0x05)
                                {
                                    setFunction(radio.Command.Mute,[0]);
                                }
                                m_waitingOnResponse = false;
                                m_responseWaitCount = 0;
                                break;
                            }
                        default:
                            {
                                break;
                            }

                    }
               // }
               return true;
	    //} , 100); //sleep every half second or so
        }
