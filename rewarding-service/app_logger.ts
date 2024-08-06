//==========================================================================
// Logger
//==========================================================================

//==========================================================================
// Format and send out the message
//==========================================================================
function showLogMessage(aTag: string | undefined, aType: string, aMsg: string, aConsoleFunc: any) {
  let now = new Date();

  if (aTag) {
    aMsg = now.toUTCString() + ' [' + aType + '][' + aTag + ']: ' + aMsg;
  }
  else {
    aMsg = now.toUTCString() + ' [' + aType + ']: ' + aMsg;
  }
  if (aConsoleFunc) {
    aConsoleFunc(aMsg);
  }
}

//==========================================================================
// Logger object
//==========================================================================
export class AppLogger {
  private myTag: string | undefined;
  private debugMode: boolean;

  constructor(aTag:string | undefined = undefined) {
    this.myTag = aTag;
    this.debugMode = false;
  }

  public log(aMsg: string) {
    showLogMessage(this.myTag, "INFO", aMsg, console.log);
  }

  public warn(aMsg: string) {
    showLogMessage(this.myTag, "WARN", aMsg, console.log);
  }

  public error(aMsg: string) {
    showLogMessage(this.myTag, "ERROR", aMsg, console.log);
  }

  public debug(aMsg: string) {
    if (this.debugMode) {
      showLogMessage(this.myTag, "DEBUG", aMsg, console.log);
    }
  }

  public setDebug(aEnable: boolean) {
    this.debugMode = aEnable;
  }

  public setTag(aTag: string) {
    this.myTag = aTag;
  }
}