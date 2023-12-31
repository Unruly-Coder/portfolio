
const ua = navigator.userAgent.toLowerCase();
export class Device {
    public static isAndroid(): boolean {
        return ua.indexOf("android") > -1;
    }

  public static isMobile(): boolean {
    return ua.indexOf("mobile") > -1;
  }
}
