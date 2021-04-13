const SLOTS_NUMBER = 3;
var jlinkList = [];
var testClientList = [];

function delay(milliseconds)
{
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

GeneralCommands =
{
    isMethodCorrect: false,

    testConnection: function ()
    {
        for (var i = 0; i < jlinkList.length; i++)
        {
            jlinkList[i].establishConnection();
        }
    },

    //---

    earaseChip: function ()
    {
        for (var slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (var i = 0; i < testClientList.length; i++)
            {
                let testClient = testClientList[i];
                let jlink = jlinkList[i];
                if(testClient.isDutAvailable(slot) && testClient.isDutChecked(slot))
                {
                    testClient.powerOn(slot);
                    delay(1000);
                    testClient.switchSWD(slot);

                    jlink.selectByUSB();
                    jlink.open();
                    jlink.setDevice("EFR32FG12PXXXF1024");
                    jlink.select();
                    jlink.setSpeed(5000);
                    jlink.connect();
                    jlink.erase();
                    jlink.close();
                }
            }
        }
    },

    //---

    unlockAndEraseChip: function ()
    {
        for (var slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (var i = 0; i < testClientList.length; i++)
            {
                let testClient = testClientList[i];
                let jlink = jlinkList[i];
                if(testClient.isDutAvailable(slot) && testClient.isDutChecked(slot))
                {
                    testClient.powerOn(slot);
                    testClient.switchSWD(slot);
                    delay(1000);

                    jlink.selectByUSB();
                    jlink.open();
                    jlink.setDevice("EFR32FG12PXXXF1024");
                    jlink.select();
                    jlink.setSpeed(5000);
                    jlink.connect();
                    if (jlink.erase() < 0)
                    {
                        testClient.powerOff(slot);
                        delay(5000);
                        testClient.powerOn(slot);
                        jlink.connect();
                        jlink.erase();
                    }

                    jlink.close();
                }
            }
        }
    },

    //---

    downloadRailtest: function (dummyFileName, railtestFileName)
    {
        actionHintWidget.showProgressHint("Downloading the Railtest...");

        for (var slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (var i = 0; i < testClientList.length; i++)
            {
                let testClient = testClientList[i];
                let jlink = jlinkList[i];
                if(testClient.isDutAvailable(slot) && testClient.isDutChecked(slot))
                {
                    testClient.powerOn(slot);
                    delay(1000);
                    testClient.switchSWD(slot);

                    jlink.selectByUSB();
                    jlink.open();
                    jlink.setDevice("EFR32FG12PXXXF1024");
                    jlink.select();
                    jlink.setSpeed(5000);
                    jlink.connect();

                    let error = jlink.erase();
                    if(error < 0)
                    {
                        testClient.setDutProperty(slot, "checked", false);
                        testClient.setDutProperty(slot, "railtestDownloaded", false);
                        logger.logError("Unable to earase chip flash memory in DUT " + testClient.dutNo(slot));
                        logger.logDebug("An error occured when erasing chip in DUT " + testClient.dutNo(slot) + " Error code: " + error);
                    }

                    else
                    {
                        logger.logInfo("Chip flash in DUT " + testClient.dutNo(slot) + " has been erased.");
                        logger.logDebug("Chip flash in DUT " + testClient.dutNo(slot) + " has been erased.");
                    }

                    if(testClient.isDutChecked(slot))
                    {
                        error = jlink.downloadFile(dummyFileName, 0);

                        if(error < 0)
                        {
                            testClient.setDutProperty(slot, "checked", false);
                            testClient.setDutProperty(slot, "railtestDownloaded", false);
                            logger.logError("Failed to load the Railtest into the chip flash memory for DUT " + testClient.dutNo(slot));
                            logger.logDebug("An error occured when downloading " + dummyFileName + " for DUT " + testClient.dutNo(slot) + " Error code: " + error);
                        }

                        else
                        {
                            error = jlink.downloadFile(railtestFileName, 0);

                            if(error < 0)
                            {
                                testClient.setDutProperty(slot, "checked", false);
                                testClient.setDutProperty(slot, "railtestDownloaded", false);
                                logger.logError("Failed to load the Railtest into the chip flash memory for DUT " + testClient.dutNo(slot));
                                logger.logDebug("An error occured when downloading " + railtestFileName + " for DUT " + testClient.dutNo(slot) + " Error code: " + error);
                            }

                            else
                            {
                                testClient.setDutProperty(slot, "railtestDownloaded", true);
                                logger.logInfo("Railtest firmware has been downloaded in DUT " + testClient.dutNo(slot));
                                logger.logDebug("Railtest firmware has been downloaded in DUT " + testClient.dutNo(slot));
                            }
                        }
                    }

                    jlink.reset();
                    jlink.go();
                    jlink.close();
                }
            }
        }

        actionHintWidget.showProgressHint("READY");
    },

    //---

    downloadSoftware: function (softwareFileName)
    {
        logger.logInfo("Software downloading started");
        actionHintWidget.showProgressHint("Downloading the software...");

        for (var slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (var i = 0; i < testClientList.length; i++)
            {
                let testClient = testClientList[i];
                let jlink = jlinkList[i];
                if(testClient.isDutChecked(slot) && (testClient.dutState(slot) === 2))
                {
                    testClient.powerOn(slot);
                    delay(1000);
                    testClient.switchSWD(slot);

                    jlink.selectByUSB();
                    jlink.open();
                    jlink.setDevice("EFR32FG12PXXXF1024");
                    jlink.select();
                    jlink.setSpeed(5000);
                    jlink.connect();

//                    let error = jlink.erase();
//                    if(error < 0)
//                    {
//                        testClient.setDutProperty(slot, "state", 3);
//                        testClient.addDutError(slot, "Failed to load the sowtware");
//                        logger.logError("Unable to earase chip flash memory in DUT " + testClient.dutNo(slot));
//                        logger.logDebug("An error occured when erasing chip in DUT " + testClient.dutNo(slot) + " Error code: " + error);
//                    }

//                    else
//                    {
//                        logger.logInfo("Chip flash in DUT " + testClient.dutNo(slot) + " has been erased.");
//                        logger.logDebug("Chip flash in DUT " + testClient.dutNo(slot) + " has been erased.");

//                        error = jlink.downloadFile(softwareFileName, 0);

//                        if(error < 0)
//                        {
//                            testClient.setDutProperty(slot, "state", 3);
//                            testClient.addDutError(slot, "Failed to load the sowtware");
//                            logger.logError("Failed to load the sowtware into the chip flash memory for DUT " + testClient.dutNo(slot));
//                            logger.logDebug("An error occured when downloading " + softwareFileName + " for DUT " + testClient.dutNo(slot) + " Error code: " + error);

//                        }

//                        else
//                        {
//                            logger.logInfo("Software has been downloaded in DUT " + testClient.dutNo(slot));
//                            logger.logDebug("Software has been downloaded in DUT " + testClient.dutNo(slot));
//                        }
//                    }

                    jlink.close();
                }

                if(testClient.isDutAvailable(slot) && testClient.isDutChecked(slot))
                    testClient.slotFullyTested(slot);
            }
        }

        actionHintWidget.showProgressHint("READY");
    },

    //---

    openTestClients: function (portsIdList)
    {
        actionHintWidget.showProgressHint("Establishing connection to the sockets...");

        let isListCorrect = false;
        let availiblePorts = testClientList[0].availiblePorts();

        for (var i = 0; i < availiblePorts.length; i++)
        {
            for (var j = 0; j < portsIdList.length; j++)
            {
                if(availiblePorts[i] === portsIdList[j])
                {
                    isListCorrect = true;
                    GeneralCommands.isMethodCorrect = true;
                }
            }
        }

        if(isListCorrect)
        {
            for (i = 0; i < testClientList.length; i++)
            {
                let testClient = testClientList[i];
                let jlink = jlinkList[i];

                if(jlink.isConnected())
                    testClient.open(portsIdList[i]);
                else
                {
                    logger.logError("Test connection to JLinks before establishing connection to sockets.");
                    logger.logDebug("Test connection to JLinks before establishing connection to sockets.");
                }
            }
        }

        else
        {
            GeneralCommands.isMethodCorrect = false;
            logger.logError("The current test method is for a different test fixture.");
            logger.logDebug("The current test method is for a different test fixture.");
        }

        actionHintWidget.showProgressHint("READY");
    },

    //---

    readCSA: function()
    {
        for (var i = 0; i < testClientList.length; i++)
        {
            let testClient = testClientList[i];
            if(testClient.isConnected())
            {
                logger.logInfo("Measuring board " + testClient.no() + " current: " + testClient.readCSA(0) + " mA");
                logger.logDebug("Measuring board " + testClient.no() + " current: " + testClient.readCSA(0) + " mA");
            }
        }
    },

    //---

    powerOn: function ()
    {
        for (var slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (var i = 0; i < testClientList.length; i++)
            {
                let testClient = testClientList[i];
                if(!testClient.isConnected())
                    continue;

                if(testClient.isDutAvailable(slot) && testClient.isDutChecked(slot))
                {
                    testClient.powerOn(slot);
                    logger.logInfo("DUT " + testClient.dutNo(slot) + " is switched ON");
                    logger.logDebug("DUT " + testClient.dutNo(slot) + " is switched ON");
                }
            }
        }
    },

    //---

    powerOff: function ()
    {
        for (var slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (var i = 0; i < testClientList.length; i++)
            {
                let testClient = testClientList[i];
                if(!testClient.isConnected())
                    continue;

                if(testClient.isDutAvailable(slot) && testClient.isDutChecked(slot))
                {
                    let testClient = testClientList[i];
                    testClient.powerOff(slot);
                    logger.logInfo("DUT " + testClient.dutNo(slot) + " is switched OFF");
                    logger.logDebug("DUT " + testClient.dutNo(slot) + " is switched OFF");
                }
            }
        }
    },

    //---

    readTemperature: function ()
    {
        for (var i = 0; i < testClientList.length; i++)
        {
            let testClient = testClientList[i];
            if(testClient.isConnected())
            {
                logger.logInfo("Measuring board " + testClient.no() + " temperature (raw ADC value): " + testClient.readTemperature());
                logger.logDebug("Measuring board " + testClient.no() + " temperature (raw ADC value): " + testClient.readTemperature());
            }
        }
    },

    //---

    clearDutsInfo: function ()
    {
        for (var i = 0; i < testClientList.length; i++)
        {
            let testClient = testClientList[i];
            for (var slot = 1; slot < SLOTS_NUMBER + 1; slot++)
            {
                testClient.resetDut(slot);
            }
        }
    },

    //---

    detectDuts: function ()
    {
        actionHintWidget.showProgressHint("Detecting DUTs in the testing fixture...");

        for (var slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (var i = 0; i < testClientList.length; i++)
            {
                let testClient = testClientList[i];

                if(!testClient.isConnected())
                    continue;

                testClient.setTimeout(500);
                testClient.powerOff(slot);
                testClient.setTimeout(10000);
            }
        }
        delay(100);


        for (slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (i = 0; i < testClientList.length; i++)
            {
                var testClient = testClientList[i];

                if(!testClient.isConnected())
                    continue;

                if(!testClientList[i].isDutChecked(slot))
                {
                    testClient.setTimeout(500);
//                    logger.logDebug("Attempting connection to slot " + slot + " of board " + testClient.no() + "...");

                    var prevCSA = testClient.readCSA(0);
                    if (prevCSA === 0)
                        prevCSA = testClient.readCSA(0);
                    testClient.powerOn(slot);
                    var currCSA = testClient.readCSA(0);
                    if (currCSA === 0)
                        currCSA = testClient.readCSA(0);

                    if((currCSA - prevCSA) > 15)
                    {
                        logger.logSuccess("Device connected to the slot " + slot + " of the test board " + testClient.no() + " detected.");
                        logger.logDebug("Device connected to the slot " + slot + " of the test board " + testClient.no() + " detected.");
                        testClient.setDutProperty(slot, "state", 1);
                        testClient.setDutProperty(slot, "checked", true);
                    }

                    else
                    {
                        logger.logDebug("No device connected to the slot " + slot + " of the test board " + testClient.no() + " detected.");
                        testClient.setDutProperty(slot, "state", 0);
                        testClient.setDutProperty(slot, "checked", false);
                    }

                    testClient.setTimeout(10000);
                }
            }
        }

        actionHintWidget.showProgressHint("READY");
    },

    //---

    readChipId: function ()
    {
        actionHintWidget.showProgressHint("Reading device's IDs...");

        for(let slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (let i = 0; i < testClientList.length; i++)
            {
                if(testClientList[i].isDutAvailable(slot) && testClientList[i].isDutChecked(slot))
                {
                    let testClient = testClientList[i];
                    let response = testClient.railtestCommand(slot, "getmemw 0x0FE081F0 2");
                    if(response.length > 4)
                    {
                        let id = response[response.length - 1].slice(2) + response[response.length - 3].slice(2);
                        testClient.setDutProperty(slot, "id", id.toUpperCase());
                        logger.logSuccess("ID for DUT " + testClient.dutNo(slot) + " has been read: " + testClient.dutProperty(slot, "id"));
                        logger.logDebug("ID for DUT " + testClient.dutNo(slot) + ": " + testClient.dutProperty(slot, "id"));
                    }

                    else
                    {
                       logger.logError("Couldn't read ID for DUT " + testClient.dutNo(slot));
                       logger.logDebug("Couldn't read ID for DUT " + testClient.dutNo(slot));
                    }
                }
            }
        }

        actionHintWidget.showProgressHint("READY");
    },

    //---

    readRTC: function ()
    {
        actionHintWidget.showProgressHint("Reading RTC values...");

        for(let slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (let i = 0; i < testClientList.length; i++)
            {
                if(testClientList[i].isDutAvailable(slot) && testClientList[i].isDutChecked(slot))
                {
                    let testClient = testClientList[i];
                    let response = testClient.railtestCommand(slot, "rtc");

                    logger.logInfo("Current RTC value for DUT " + testClient.dutNo(slot) + " has been read.");
                    logger.logDebug("RTC value for DUT " + testClient.dutNo(slot) + ": " + response.slice(7));
                }
            }
        }

        actionHintWidget.showProgressHint("READY");
    },

    //---

    testAccelerometer: function ()
    {
        actionHintWidget.showProgressHint("Testing Accelerometer...");

        for(let slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (let i = 0; i < testClientList.length; i++)
            {
                if(testClientList[i].isDutAvailable(slot) && testClientList[i].isDutChecked(slot))
                {
                    let testClient = testClientList[i];
                    let response = testClient.railtestCommand(slot, "accl");
                    let patternFound = false;

                    if(response.length < 3)
                    {
                        testClient.setDutProperty(slot, "accelChecked", false);
                        testClient.addDutError(slot, response.join(' '));
                        logger.logError("Accelerometer failture for DUT " + testClient.dutNo(slot) + ". No response recieved.");
                        logger.logDebug("Accelerometer failture for DUT " + testClient.dutNo(slot) + ". No response recieved.");
                    }

                    else
                    {
                        for (let j = 0; j < response.length; j++)
                        {
                            if((j + 2) < response.length)
                            {
                                if (response[j].includes("X") && response[j + 1].includes("Y") && response[j + 2].includes("Z"))
                                {
                                    patternFound = true;
                                    let x = Number(response[j].slice(2, 5));
                                    let y = Number(response[j + 1].slice(2, 5));
                                    let z = Number(response[j + 2].slice(2, 5));

                                    if (x > 10 || x < -10 || y > 10 || y < -10 || z < -90 || z > 100)
                                    {
                                        testClient.setDutProperty(slot, "accelChecked", false);
                                        testClient.addDutError(slot, response.join(' '));
                                        logger.logDebug("Accelerometer failure for DUT " + testClient.dutNo(slot) + "; X=" + x +", Y=" + y + ", Z=" + z + ".");
                                        logger.logError("Accelerometer failture for DUT " + testClient.dutNo(slot));
                                    }
                                    else
                                    {
                                        testClient.setDutProperty(slot, "accelChecked", true);
                                        logger.logSuccess("Accelerometer for DUT " + testClient.dutNo(slot) + " has been tested successfully.");
                                        logger.logDebug("Accelerometer values for DUT " + testClient.dutNo(slot) + "; X=" + x +", Y=" + y + ", Z=" + z);
                                    }

                                    break;
                                }
                            }
                        }
                    }

                    if(!patternFound)
                    {
                        testClient.setDutProperty(slot, "accelChecked", false);
                        testClient.addDutError(slot, response.join(' '));
                        logger.logError("Accelerometer failture for DUT " + testClient.dutNo(slot) + ". Invalid response recieved.");
                        logger.logDebug("Accelerometer failure. Invalid response: " + response);
                    }
                }
            }
        }

        actionHintWidget.showProgressHint("READY");
    },

    //--

    testLightSensor: function ()
    {
        actionHintWidget.showProgressHint("Testing light sensor...");

        for(let slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (let i = 0; i < testClientList.length; i++)
            {
                if(testClientList[i].isDutAvailable(slot) && testClientList[i].isDutChecked(slot))
                {
                    let testClient = testClientList[i];
                    let response = testClient.railtestCommand(slot, "lsen");
                    let patternFound = false;

                    if(response.length > 1)
                    {
                        if (response[1].includes("opwr"))
                        {
                            patternFound = true;
                            let x = Number(response[1].slice(5, 5));

                            if (x < 0)
                            {
                                testClientList.setDutProperty(slot, "lightSensChecked", false);
                                testClientList.addDutError(slot, response.join(' '));
                                logger.logDebug("Light sensor failure: OPWR=" + x  + ".");
                                logger.logError("Light sensor failture for DUT " + testClient.dutNo(slot));
                            }
                            else
                            {
                                testClient.setDutProperty(slot, "lightSensChecked", true);
                                logger.logSuccess("Light sensor for DUT " + testClient.dutNo(slot) + " has been tested successfully.");
                                logger.logDebug("Light sensor value: OPWR=" + x);
                            }
                        }
                    }

                    if(!patternFound)
                    {
                        testClient.setDutProperty(slot, "lightSensChecked", false);
                        testClient.addDutError(slot, response.join(' '));
                        logger.logError("Light sensor failture for DUT " + testClient.dutNo(slot));
                        logger.logDebug("Light sensor failture for DUT " + testClient.dutNo(slot) + ": " + response.join(' '));
                    }
                }
            }
        }

        actionHintWidget.showProgressHint("READY");
    },

    //---

    testRadio: function (RfModuleId, channel, powerTable, minRSSI, maxRSSI, count)
    {
        actionHintWidget.showProgressHint("Testing radio interface...");

        for(let slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (let i = 0; i < testClientList.length; i++)
            {
                if(testClientList[i].isDutAvailable(slot) && testClientList[i].isDutChecked(slot))
                {
                    logger.logDebug("Radio testing for DUT " + testClientList[i].dutNo(slot) + " with power value: " + powerTable[testClientList[i].dutNo(slot) - 1]);
                    testClientList[i].testRadio(slot, RfModuleId, channel, powerTable[testClientList[i].dutNo(slot) - 1], minRSSI, maxRSSI, count);
                }
            }
        }

        actionHintWidget.showProgressHint("READY");
    },

   //---

    testDALI: function ()
    {
        actionHintWidget.showProgressHint("Testing DALI interface...");

        GeneralCommands.powerOn();

        for (var i = 0; i < testClientList.length; i++)
        {
            if(testClientList[i].isConnected())
                testClientList[i].daliOn();
        }
        delay(500);

//        for(let slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        for(let slot = 3; slot > 0; slot--)
        {
            for (let i = 0; i < testClientList.length; i++)
            {
                if(testClientList[i].isDutAvailable(slot) && testClientList[i].isDutChecked(slot))
                {
                    let testClient = testClientList[i];
                    let responseString = testClient.railtestCommand(slot, "dali 0xFF90 16 0 1000000").join(' ');

                    if(responseString.includes("error:0"))
                    {
                        testClient.setDutProperty(slot, "daliChecked", true);
                        logger.logSuccess("DALI interface for DUT " + testClient.dutNo(slot) + " has been tested successfully.");
                        logger.logDebug("DALI interface for DUT " + testClient.dutNo(slot) + " has been tested successfully.");
                    }

                    else
                    {
                        testClient.setDutProperty(slot, "daliChecked", false);
                        testClient.addDutError(slot, responseString);
                        logger.logError("DALI testing for DUT " + testClient.dutNo(slot) + " has been failed.");
                        logger.logDebug("DALI failure for DUT " + testClient.dutNo(slot) + ": " + responseString);
                    }
                }
            }
        }

        for (i = 0; i < testClientList.length; i++)
        {
            if(testClientList[i].isConnected())
                testClientList[i].daliOff();
        }

        actionHintWidget.showProgressHint("READY");
    },

    testGNSS: function ()
    {
        actionHintWidget.showProgressHint("Testing GNSS module...");

        GeneralCommands.powerOn();
        delay(1000);

        for(let slot = 1; slot < SLOTS_NUMBER + 1; slot++)
        {
            for (let i = 0; i < testClientList.length; i++)
            {
                if(testClientList[i].isDutAvailable(slot) && testClientList[i].isDutChecked(slot))
                {
                    let testClient = testClientList[i];
                    let responseString = testClient.railtestCommand(slot, "gnrx 3").join(' ');
                    if (responseString.includes("line"))
                    {
                        testClient.setDutProperty(slot, "gnssChecked", true);
                        logger.logSuccess("GNSS module for DUT " + testClient.dutNo(slot) + " has been tested successfully.");
                        logger.logDebug("GNSS module for DUT " + testClient.dutNo(slot) + " has been tested successfully.");
                    }

                    else
                    {
                        testClient.setDutProperty(slot, "gnssChecked", false);
                        testClient.addDutError(slot, responseString);
                        logger.logDebug("GNSS module failture: " + responseString);
                        logger.logError("GNSS module failture for DUT " + testClient.dutNo(slot));

                    }
                }
            }
        }

        actionHintWidget.showProgressHint("READY");
    }
}
