/*
MIT License

Copyright (c) 2021 James Gardner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
import * as interfaces from "../sdmx/interfaces";
import * as sdmx20 from "../sdmx/sdmx20";
import * as sdmx21 from "../sdmx/sdmx21";
import * as message from "../sdmx/message";
import * as commonreferences from "../sdmx/commonreferences";
export class SdmxParser {
  public static PARSER: Array<interfaces.SdmxParserProvider> = [];
  public static parseStructure(s: string): message.StructureType|undefined{
    for (let i = 0; i < SdmxParser.PARSER.length; i++) {
      if (SdmxParser.PARSER[i].canParse(s)) {
        return SdmxParser.PARSER[i].parseStructure(s);
      }
      // else {
      //    alert("not my type");
      // }
    }
    return undefined;
  }

  public static parseData(s: string): message.DataMessage|undefined {
    for (let i = 0; i < SdmxParser.PARSER.length; i++) {
      if (SdmxParser.PARSER[i].canParse(s)) {
        return SdmxParser.PARSER[i].parseData(s);
      }
    }
    return undefined;
  }

  public static registerParserProvider(p: interfaces.SdmxParserProvider) {
    SdmxParser.PARSER.push(p);
  }

  public static getBaseHeader(): message.Header {
    const header: message.Header = new message.Header();
    header.setId("none");
    header.setTest(false);
    const sender: message.Sender = new message.Sender();
    sender.setId(new commonreferences.ID("Sdmx-Sax"));
    header.setSender(sender);
    const receiver: message.PartyType = new message.PartyType();
    receiver.setId(new commonreferences.ID("You"));
    header.setReceivers([receiver]);
    // let htt:message.HeaderTimeType = new message.HeaderTimeType();
    // htt.setDate(DateTime.now());
    // header.setPrepared(htt);
    return header;
  }
}
SdmxParser.registerParserProvider(new sdmx20.Sdmx20StructureParser());
SdmxParser.registerParserProvider(new sdmx21.Sdmx21StructureParser());

export default { SdmxParser: SdmxParser };
