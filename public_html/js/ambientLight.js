angular.module('tinkerforge', ['ui.bootstrap', 'tc.chartjs'])
.controller('MainCtlr', ['$scope', 'TinkerforgeService', function ($scope, TinkerforgeService) {
        "use strict";
    
    function callbackTouch(nr) {
            $scope.touch.nr = nr;
            if (nr === 0) {
                $scope.chartData.datasets[0].data.splice(0, $scope.chartData.datasets[0].data.length);
                $scope.chartData.labels.splice(0, $scope.chartData.labels.length);
            }
            $scope.$apply();
        }
        
    function callbackIlluminance(illuminance) {
            $scope.luxValue = illuminance / 10;
            if ($scope.chartData.labels.length > MAX_DIAGRAMM_VALUES) {
                $scope.chartData.datasets[0].data.shift();
                $scope.chartData.labels.shift();
            }
            $scope.chartData.datasets[0].data.push($scope.luxValue);
            $scope.chartData.labels.push("");
            $scope.$apply();
        };
    
    
    function createAmbientLight(uid) {
            
            var device;
            
            function connectFn(ipcon) {
                device =new Tinkerforge.BrickletAmbientLight(uid, ipcon);
                device.on(Tinkerforge.BrickletAmbientLight.CALLBACK_ILLUMINANCE,   callbackIlluminance  );
 
            }
            
            function connectedFn() {
                device.setIlluminanceCallbackPeriod(1000);
            }
            
            return {
                connect: connectFn,
                connected: connectedFn
            };
        };
    
    function createMultitouch(uid) {

        var device;

        function connectFn(ipcon) {
            device = new Tinkerforge.BrickletMultiTouch(uid, ipcon);
            device.on(Tinkerforge.BrickletMultiTouch.CALLBACK_TOUCH_STATE,
                // Callback function for touch state
                function(touchState) {
                    var s = '';
                    if(touchState & (1 << 12)) {
                        console.log('In proximity');
                    }
                    if((touchState & 0xFFF) === 0) {
                        console.log('No electrodes touched');
                    }
                    else {
                        for(var i=0; i<12; i++) {
                            if(touchState & (1 << i)) {
                                callbackTouch(i);
                            }
                        }
                    }
                 }
            ); 
        }

        return {
            connect: connectFn
        };
    };

    function errorCallback(error) {
        $scope.tinkerforgeError = 'Error: ' + error + '\n';
        $scope.$apply();
        $scope.running = false;
    }
    
    var MAX_DIAGRAMM_VALUES = 40;
    $scope.ambientUid = 'meo',
    $scope.touchUid = 'jU1',
    $scope.host = 'localhost',
    $scope.port = "4280";

    $scope.maxLux = "200.0";
    $scope.touch = {};
    $scope.touch.nr = "";
    $scope.running = false;
    $scope.tinkerforgeError ="";

    $scope.startIpConnection = function() {

        var devices = [];
        devices.push(createAmbientLight($scope.ambientUid));
        devices.push(createMultitouch($scope.touchUid));

        TinkerforgeService.startIpConnection(devices, $scope.host, $scope.port, errorCallback);
        $scope.running = true;
    };

    $scope.chartData = {
         labels: [],
         datasets: [
           {
             label: '',
             fillColor: 'rgba(220,220,220,0.2)',
             strokeColor: 'rgba(255,0,0,1)',
             pointColor: 'rgba(220,220,220,1)',
             pointStrokeColor: '#fff',
             pointHighlightFill: '#fff',
             pointHighlightStroke: 'rgba(220,220,220,1)',
             data: []
           }
         ]
       };

    // Chart.js Options
    $scope.chartOptions =  {

      scaleShowGridLines : true,
            scaleGridLineColor : "rgba(0,0,0,.05)",
      scaleGridLineWidth : 1,
      bezierCurve : true,
      bezierCurveTension : 0.4,
      pointDot : true,
      pointDotRadius : 4,
      pointDotStrokeWidth : 1,
      pointHitDetectionRadius : 20,
      datasetStroke : true,
      datasetStrokeWidth : 2,
      datasetFill : true,
      onAnimationProgress: function(){},
      onAnimationComplete: function(){},
      legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
    };



}]).factory('TinkerforgeService', ['$q', function ($q) {
    "use strict";

    var deviceTypes = {
        11:	'Brick DC',
        13: 'Brick Master',
        14: 'Brick Servo',
        15: 'Brick Stepper',
        16: 'Brick IMU',
        17:'Brick RED',
        21:'Bricklet Ambient Light',
        23:'Bricklet Current12',
        24:'Bricklet Current25',
        25: 'Bricklet Distance IR',
        26: 'Bricklet Dual Relay',
        27: 'Bricklet Humidity',
        28: 'Bricklet IO-16',
        29: 'Bricklet IO-4',
        210: 	'Bricklet Joystick',
        211: 	'Bricklet LCD 16x2',
        212: 	'Bricklet LCD 20x4',
        213: 	'Bricklet Linear Poti',
        214: 	'Bricklet Piezo Buzzer',
        215: 	'Bricklet Rotary Poti',
        216: 	'Bricklet Temperature',
        217: 	'Bricklet Temperature IR',
        218:	'Bricklet Voltage',
        219:	'Bricklet Analog In',
        220: 	'Bricklet Analog Out',
        221: 	'Bricklet Barometer',
        222: 	'Bricklet GPS',
        223: 	'Bricklet Industrial Digital In 4',
        224: 	'Bricklet Industrial Digital Out 4',
        225: 	'Bricklet Industrial Quad Relay',
        226: 	'Bricklet PTC',
        227: 	'Bricklet Voltage/Current',
        228: 	'Bricklet Industrial Dual 0-20mA',
        229: 	'Bricklet Distance US',
        230: 	'Bricklet Dual Button',
        231: 	'Bricklet LED Strip',
        232: 	'Bricklet Moisture',
        233: 	'Bricklet Motion Detector',
        234: 	'Bricklet Multi Touch',
        235: 	'Bricklet Remote Switch',
        236: 	'Bricklet Rotary Encoder',
        237: 	'Bricklet Segment Display 4x7',
        238: 	'Bricklet Sound Intensity',
        239: 	'Bricklet Tilt',
        240: 	'Bricklet Hall Effect',
        241: 	'Bricklet Line',
        242: 	'Bricklet Piezo Speaker',
        243: 	'Bricklet Color',
        244: 	'Bricklet Solid State Relay',
        245: 	'Bricklet Heart Rate',
        246: 	'Bricklet NFC/RFID'
    };

        function disconnectIp(errorCallback) {
             IPConnection.disconnect(errorCallback);
        }

        function startIpConnectionFn(devices, HOST, PORT, errorCallback) {
            var ipcon = new Tinkerforge.IPConnection(),
                i;
            
            for(i=0; i<devices.length;i++) {
                devices[i].connect(ipcon);
            }

            ipcon.connect(HOST, PORT,
                function (error) {
                    errorCallback(error);
                }
            ); // 
            ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
                function (connectReason) {
                    var i;
                    for(i=0; i<devices.length;i++) {
                        if (devices[i].connected) {
                            devices[i].connected(ipcon);
                        }    
                    }
                   ipcon.enumerate();
                    
                }
            );
        
            // Register Enumerate Callback
            ipcon.on(Tinkerforge.IPConnection.CALLBACK_ENUMERATE,
                // Print incoming enumeration
                function(uid, connectedUid, position, hardwareVersion, firmwareVersion,
                         deviceIdentifier, enumerationType) {
                    console.log('UID: '+uid+', Enumeration Type: '+enumerationType);
                    console.log('Position: '+position+', Device Identifier: '+ deviceTypes[deviceIdentifier]);
                    console.log('Hardware Version: '+hardwareVersion+', Firmware Version: '+firmwareVersion);
                }
            );
        
         }


        return {
            startIpConnection: startIpConnectionFn
        };
    }]);
