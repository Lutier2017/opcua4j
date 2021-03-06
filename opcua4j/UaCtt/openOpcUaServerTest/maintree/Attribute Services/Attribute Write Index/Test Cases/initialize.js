include( "./library/Base/connect.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/indexRangeRelatedUtilities.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
// include all library scripts specific to write tests
include( "./library/ServiceBased/AttributeServiceSet/Write/check_write_valid.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/check_write_error.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/check_write_failed.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/writeMask_writeValues.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
// include libraries for Read verification of writes
include( "./library/ServiceBased/AttributeServiceSet/Read/check_read_valid.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );

var OPTIONAL_CONFORMANCEUNIT = true;
var WRITEVERIFICATION_OFF = false;
addLog( "TESTING AN -- OPTIONAL -- CONFORMANCE UNIT" );

// Connect to the server 
var g_channel = new UaChannel();
var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
if( !connect( g_channel, g_session ) )
{
    addError( "Connect()");
    stopCurrentUnit();
}

var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0, Attribute.Value );
if( items === null || items.length === 0 )
{
    _dataTypeUnavailable.store( "Arrays" );
    stopCurrentUnit();
    return;
}

// create some Helpers
var WRITE = new Write( g_session );
var READ  = new Read(  g_session );

// read the original values of all scalar types, because we will revert to their original values at 
// the end of the test 
var originalArrayScalarValues = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic() );
if( originalArrayScalarValues === null || originalArrayScalarValues.length === 0 )
{
    stopCurrentUnit();
}
else
{
    if( READ.Execute( originalArrayScalarValues ) )
    {
        for( var i=0; i<originalArrayScalarValues.length; i++ )
        {
            originalArrayScalarValues[i].OriginalValue = originalArrayScalarValues[i].Value.Value.clone();
        }
    }
}

function revertToOriginalValues()
{
    print( "\n\n\n\nReverting Array scalar static nodes back to their original values." );
    for( var i=0; i<originalArrayScalarValues.length; i++ )
    {
        originalArrayScalarValues[i].Value.Value = originalArrayScalarValues[i].OriginalValue.clone();
    }
    // allow these to pass or fail, we kind of dont care from a compliance perspective
    var expectedResults = [];
    for( var i=0; i<items.length; i++ )
    {
        expectedResults[i] = new ExpectedAndAcceptedResults( StatusCode.Good );
        expectedResults[i].addExpectedResult( StatusCode.BadWriteNotSupported );
    }
    WRITE.Execute( originalArrayScalarValues, expectedResults, true, OPTIONAL_CONFORMANCEUNIT );
}