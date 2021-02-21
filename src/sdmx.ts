/*
    This file is part of sdmx-js.

    sdmx-js is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    sdmx-js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with sdmx-js.  If not, see <http://www.gnu.org/licenses/>.
    Copyright (C) 2016 James Gardner
*/

import * as interfaces from "./sdmx/interfaces";

import * as abs from "./sdmx/abs3";
//import * as oecd from "./sdmx/oecd";
//import * as knoema from "./sdmx/knoema";
//import * as nomis from "./sdmx/nomis";
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
    /*
        if (s === "KNOEMA") {
          return new knoema.Knoema("KNOEMA", "http://knoema.com/api/1.0/sdmx", "");
        }
        if (s === "NOMIS") {
          return new nomis.NOMISRESTServiceRegistry(
            "NOMIS",
            "http://www.nomisweb.co.uk/api",
            "uid=0xad235cca367972d98bd642ef04ea259da5de264f"
          );
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
