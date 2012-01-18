/*
* node-gmlan: Control your SWCAN bus with Node
*
* Copyright (c) 2011 Jakob Perry
* node-gmlan is freely distributable under the terms of the GPLv2 license.
*/
var buffertools = require('buffertools');
var fs = require('fs');
var sys = require('util');
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

const SERIAL_BAUDRATE = 19200;

var m_port;
var m_deviceInitialized; //bool 
var m_devicePowered;  //bool
var m_currentFreq;   //int 
var m_HDLock = false; //bool
var m_currentChannel = new RadioChannel(929);

function RadioChannel(freq) {
        this.m_freq = freq;
        this.m_HDChannels = 0;
	this.m_callSign = '';
	this.m_currentHDChannel = 0;
	this.m_RDSRadioText = '';
	this.m_RDSProgramService = '';
	this.m_RDSGenre = '';
	this.m_HDSignalStrength = 0;
}

BoomzBox = function (path) {
  m_devicePowered = false;
  this.m_port = new SerialPort(path, {
     baudrate: SERIAL_BAUDRATE,
     parser: serialport.parsers.raw,
     buffersize: 255});
  m_deviceInitialized = false;
}

BoomzBox.prototype = {
  scanDown : function() {
        setFunction(Command.TuneDown, ['00']);
    } 
  , scanUp : function() {
        setFunction(Command.TuneUp, ['00']);
    }
  , seekUp : function() {
        //Seek Up
        setFunction(Command.Seek_All,['00', '01']);
    }
  , seekDown : function() {
        //Seek Down
        setFunction(Command.Seek_All,['01', '01']);
    }
  , tune : function(value) {
        setFunction(Command.Tune, ['01', value]);
    }
  , selectNextHD : function()
    {
        if (m_HDLock)
        {
            if (m_currentChannel.m_currentHDChannel + 1 > m_currentChannel.m_HDChannels)
            {
                setFunction(Command.HDSelect, ['00']);
            }
            else
            {
                setFunction(Command.HDSelect, [m_currentChannel.m_currentHDChannel]);
            }
        }
    }
  , PowerOff : function() {
        threadRunning = false;
        m_port.DtrEnable = false;
        m_port.close();
        return true;
    }
  , sendCommand : function(cmd) {
	console.log("command funct sent ..:"+cmd);
        var cmdToSend = new Array(cmd.length + 5);
	//copy the cmd into the cmdToSend array
	for (i = 0; i < cmd.length; i++) {
	   (cmd[i].length < 2) ? cmdToSend[i+4] = '0' + cmd[i] : cmdToSend[i+4] = cmd[i];
	}
        cmdToSend[0] = '5a';
        cmdToSend[1] = 'a5';
	cmdToSend[2] = '00';
        num = '00';
	for (i = 4; i < cmdToSend.length - 1; i++)
        {
            num = num ^ cmdToSend[i];
        }
        if (cmdToSend.length < 255)
        {
	    (cmd.length.toString(16).length < 2) ? cmdToSend[3] = '0' + cmd.length.toString(16) : cmdToSend[3] = cmd.length.toString(16);
        }
        cmdToSend[cmdToSend.length - 1] = num.toString(16);
	console.log("command pre split" + cmdToSend);
	console.log("the command is"+cmdToSend.join(""));
	var buffer = new Buffer("5aa50001f3f3");
	console.log("sending full command ... " + buffer.fromHex().toHex());
//        addToQueue(cmdToSend);
    }
   , setFunction : function(cmd, set) {
        var b = new Array();
        b.push(cmd);
        for (var i = 0; i < set.length; i++)
        {
	   (set[i].toString(16).length < 2) ? b.push('0' + set[i].toString(16)) : b.push(set[i].toString(16));
           //b.push(set[i].toString(16));
        }
        this.sendCommand(b);
    }
};

BoomzBox.prototype.Message = {
    "Tune" : '0102'
  };
BoomzBox.prototype.Command = {
	"AutoMessage" : '01',
	"Band" : '02',
	"HDSelect" : '04',
	"Tune" : '05',
	"TuneUp" : '06',
	"TuneDown" : '07',
	"Seek_All" : '08',
	"Seek_HD" : '09',
	"Seek_Stop" : '0a',
	"Volume" : '0b',
	"Version" : '0c',
	"Mute" : '0d',
	"Antenna" : '0e'
  };

exports.connect = function (path) {
  return new BoomzBox(path);
};
