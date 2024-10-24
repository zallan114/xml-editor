import { js2xml, xml2js } from "xml-js";
import { cloneDeep } from "lodash";

export interface XmlObjectType {
  [key: string]: any; // This allows for any string key to be used with any value.
}

export interface NodeKv {
  key?: string;
  text?: string;
  value?: any;
  parent?: any;
}

export class UtilityClass {
  static mergeAcc(
    acc1: Record<string, any>,
    acc2: Record<string, any>
  ): Record<string, any> {
    const mergedAcc: Record<string, any> = { ...acc1 };
    if (acc2) {
      Object.keys(acc2).forEach((key) => {
        mergedAcc[key] = acc2[key];
      });
    }
    return mergedAcc;
  }

  static processValue(
    key: string,
    value: any,
    acc: Record<string, any>
  ): Record<string, any> {
    if (Array.isArray(value)) {
      value.forEach((subValue, index) => {
        if (Array.isArray(subValue)) {
          const newKey = `${key}[${index}]`;
          acc[newKey] = this.processValue(newKey, subValue, {});
        } else {
          acc[`${key}[${index}]`] = subValue;
        }
      });
    } else if (typeof value === "object") {
      const filteredKeys = Object.keys(value).filter(
        (key) => !key.startsWith("_")
      );
      filteredKeys.forEach((subKey) => {
        const newKey = `${subKey}`; //`${key}.${subKey}`;
        //if its children are Array, merge that level keys...
        if (Array.isArray(value[newKey])) {
          let tacc: Record<string, any> = {};

          tacc = this.processValue(subKey, value[subKey], {});
          acc = this.mergeAcc(acc, tacc);
        } else {
          acc[newKey] = this.processValue(subKey, value[subKey], {});
        }
      });
    } else {
      acc[key] = value;
    }
    return acc;
  }

  static arrayDel(data: any[], name: any): void {
    const indexToRemove = data.findIndex((item) => item === name);
    if (indexToRemove !== -1) {
      data.splice(indexToRemove, 1);
    }
  }

  static deepCopy(originalObject: XmlObjectType): any {
    const newObject: XmlObjectType = cloneDeep(originalObject);
    return newObject;
  }

  static jsonToXml(json: XmlObjectType): string {
    // Convert JSON to XML
    const xmlOptions = { compact: true, ignoreComment: true, spaces: 4 };
    const xmlString = js2xml(json, xmlOptions);
    return xmlString;
  }

  static xmlDomToJson(xml: string): any {
    const jsonObject: XmlObjectType = xml2js(xml, { compact: true });
    return jsonObject;
  }

  static export_raw(name: string, data: string) {
    const urlObject = window.URL || window.webkitURL || window;
    const exportBlob = new Blob([data]);

    const saveLink = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "a"
    ) as HTMLAnchorElement;
    saveLink.href = urlObject.createObjectURL(exportBlob);
    saveLink.download = name;
    UtilityClass.fakeClick(saveLink);
  }

  static fakeClick(element: HTMLElement) {
    const event = new MouseEvent("click");
    element.dispatchEvent(event);
  }
}
