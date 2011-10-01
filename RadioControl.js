var http = require('http');
var sys = require("util"), repl = require("repl");
var boomzbox = require('./BoomzBox')
  , radio = boomzbox.connect('/dev/ttyUSB1')
  , express=require('express'),
    app = express.createServer();
  ;
  
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/tune', function(req, res){
  //setting pin mode here because i could not get it to work when setting it up top
  setTimeout(function() { radio.tune('92.9'); } , 2000);	
  res.send("Car is on 92.9!");
});
//	require('url').parse(req.url);
//res.end(JSON.stringify(require('url').parse(req.url)));

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

	    var buf = new Buffer(array);
	    var m_port = radio.m_port;

        try
        {

            //nextQueue();   
            //m_statusTimer = new System.Threading.Timer(new TimerCallback(statusTimerCallback), null, 1000, 1000);

	   //lets run through the thread every 200ms or so
     	    setInterval(function() {
	        m_port.on("data", function (data) {
		   console.log(data);
		   buf.push(data);
	        });

                first = true;
                start = 0;
                end = 0;
                byteList = new Array();
                for (i = 0; i < buf.length - 1; i++)
                {
                    if ((buf[i] == 0x5A) && (buf[i + 1] == 0xA5))
                    {
                        if (first)
                        {
                            start = i;
                            first = false;
                        }
                        else
                        {
                            end = i;
                            var buf2 = new Buffer(end - start);
                            buf.copy(buf2, 0, start, end - start);
                            buf.slice(start, end - start);
                            i -= (end - start);
                            byteList.push(buf2);
                        }
                    }
                }
                for (i = 0; i < byteList.Count; i++)
                {
                    switch (byteList[i][4])
                    {
                        case 0xF1: //Status message
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
                        case 0xF2: //RDS
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
                        case 0xF3: //Power on notice.
                            {
                                if (!m_deviceInitialized)
                                {
                                    radio.m_deviceInitialized = true;
                                }
				
                                m_waitingOnResponse = false;
                                m_responseWaitCount = 0;
				
			        radio.setFunction(radio.Command.Version,[1]);
			        radio.setFunction(radio.Command.Mute,[1]);
			        radio.setFunction(radio.Command.Volume,[0]);
			        radio.setFunction(radio.Command.Antenna,[1]);
			        radio.setFunction(radio.Command.AutoMessage,[1, 1, 1, 1, 1, 1]);
			        radio.setFunction(radio.Command.Mute,[0]);
			        radio.setFunction(radio.Command.Volume,[70]);
                                //nextQueue();
                                break;
                            }
                        case 0xF5:
                            {
                                msg = byteList[i].toString(Encoding);
				console.log(msg);                                
				break;
                            }
                        case 0xF6: //Tuning status message
                            {
                                radio.m_currentChannel.m_HDSignalStrength = byteList[i][6];
                                break;
                            }
                        case 0xFF:
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
                }
                byteList = [];
	    } , 100); //sleep every half second or so
        }
        catch (ex)
        {
            Error(ex.Message);
            if (m_port.IsOpen)
            {
                //m_port.DtrEnable = false;
                m_port.Close();
            }
        }
