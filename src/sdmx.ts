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

import * as interfaces from "./sdmx/interfaces";

import * as abs from "./sdmx/abs3";
//import * as oecd from "./sdmx/oecd";
//import * as knoema from "./sdmx/knoema";
import * as nomis from "./sdmx/nomis";
//import * as ilo from "./sdmx/ilo";
import * as estat from "./sdmx/estat";
//import * as insee from "./sdmx/insee";
import * as Language from "./sdmx/language";
export class SdmxIO {
  public static getLocale(): string {
    return Language.Language.getLanguage();
  }

  public static listServices(): Array<string> {
    return ["NOMIS", "ABS3", "INSEE", "OECD", "KNOEMA", "AfDB", "ILO", "ESTAT"];
    // return ["OECD"];
  }

  public static connect(s: string): interfaces.Queryable | undefined {
    if (s === "ABS3") {
      return new abs.ABS3(
        "ABS",
        "https://api.data.abs.gov.au", ""
      );
    }
    if (s === "ESTAT") {
      return new estat.ESTAT(
        "ESTAT",
        "https://ec.europa.eu/eurostat/SDMX/diss-web/rest",
        ""
      );
    }
    if (s === "NOMIS") {
      return new nomis.NOMISRESTServiceRegistry(
        "NOMIS",
        "http://www.nomisweb.co.uk/api",
        "uid=0xad235cca367972d98bd642ef04ea259da5de264f"
      );
    }
    /*
        if (s === "KNOEMA") {
          return new knoema.Knoema("KNOEMA", "http://knoema.com/api/1.0/sdmx", "");
        }

        if (s === "OECD") {
          return new oecd.OECD(
            "OECD",
            "https://kalessine.herokuapp.com/http://stats.oecd.org/Sdmxws/sdmx.asmx",
            "http://stats.oecd.org/OECDStatWS/SDMX/"
          );
        }
        if (s === "AfDB") {
          return new knoema.Knoema(
            "AfDB",
            "http://opendataforafrica.org/api/1.0/sdmx",
            ""
          );
        }
        if (s === "ILO") {
          return new ilo.ILO(
            "ILO",
            "https://kalessine.herokuapp.com/http://www.ilo.org/sdmx/rest",
            ""
          );
        }
        if (s === "INSEE") {
          return new insee.INSEE(
            "INSEE",
            "https://kalessine.herokuapp.com/http://www.bdm.insee.fr/series/sdmx",
            ""
          );
        }*/
    return undefined;
  }
}

export default {
  SdmxIO: SdmxIO
};
