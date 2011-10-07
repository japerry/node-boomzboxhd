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
        setFunction(Command.TuneDown, [0]);
    } 
  , scanUp : function() {
        setFunction(Command.TuneUp, [0]);
    }
  , seekUp : function() {
        //Seek Up
        setFunction(Command.Seek_All,[0, 1]);
    }
  , seekDown : function() {
        //Seek Down
        setFunction(Command.Seek_All,[1, 1]);
    }
  , tune : function(value) {
        setFunction(Command.Tune, [1, value]);
    }
  , selectNextHD : function()
    {
        if (m_HDLock)
        {
            if (m_currentChannel.m_currentHDChannel + 1 > m_currentChannel.m_HDChannels)
            {
                setFunction(Command.HDSelect, [0]);
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
        var cmdToSend = new Array(cmd.length + 5);
	//copy the cmd into the cmdToSend array
	for (i = 0; i < cmd.length; i++) {
	   cmdToSend[i+4] = cmd[i];
	}
        cmdToSend[0] = 0x5A;
        cmdToSend[1] = 0xA5;
	cmdToSend[2] = 0x00;
        num = 0x00;
	for (i = 2; i < cmdToSend.length - 1; i++)
        {
            num = num ^ cmdToSend[i];
        }
        if (cmdToSend.length < 255)
        {
            cmdToSend[3] = cmd.length;
        }
        cmdToSend[cmdToSend.length - 1] = num;
	console.log("the command is"+cmdToSend.join(""));
	var buffer = new Buffer("5aa50001f3f3");
	console.log("sending full command ... " + buffer.fromHex().toHex());
//        addToQueue(cmdToSend);
    }
   , setFunction : function(cmd, set) {
        var b = new Array();
        if(cmd.length > 3) {
	  b.push(cmd >> 8);
	}
        b.push(cmd);
        var pos = 1;
        for (var i = 0; i < set.length; i++)
        {
            if (set[i] > 255)
            {
                b.push(set[i] >> 8);
                b.push(set[i]);
            }
            else
            {
                b.push(set[i]);
            }
        }
        this.sendCommand(b);
    }
};

BoomzBox.prototype.Message = {
    "Tune" : 0x0102
  };
BoomzBox.prototype.Command = {
	"AutoMessage" : 0x01,
	"Band" : 0x02,
	"HDSelect" : 0x04,
	"Tune" : 0x05,
	"TuneUp" : 0x06,
	"TuneDown" : 0x07,
	"Seek_All" : 0x08,
	"Seek_HD" : 0x09,
	"Seek_Stop" : 0x0A,
	"Volume" : 0x0B,
	"Version" : 0x0C,
	"Mute" : 0x0D,
	"Antenna" : 0x0E
  };

exports.connect = function (path) {
  return new BoomzBox(path);
};
