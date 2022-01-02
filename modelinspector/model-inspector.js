const IconsData = {
  ClickDetector: "TreeViewIcons/ClickDetector.png",
  Environment: "TreeViewIcons/Environment.png",
  Game: "TreeViewIcons/Game.png",
  Hidden: "TreeViewIcons/Hidden.png",
  Lighting: "TreeViewIcons/Lighting.png",
  LocalScript: "TreeViewIcons/LocalScript.png",
  Model: "TreeViewIcons/Model.png",
  NPC: "TreeViewIcons/NPC.png",
  object: "TreeViewIcons/object.png",
  Part: "TreeViewIcons/Part.png",
  Players: "TreeViewIcons/Players.png",
  PointLight: "TreeViewIcons/PointLight.png",
  RemoteEvent: "TreeViewIcons/RemoteEvent.png",
  ScriptInstance: "TreeViewIcons/ScriptInstance.png",
  ScriptService: "TreeViewIcons/ScriptService.png",
  Sound: "TreeViewIcons/Sound.png",
  Text3D: "TreeViewIcons/Text3D.png",
  Truss: "TreeViewIcons/Truss.png",
  Decal: "TreeViewIcons/Decal.png",
  Tool: "TreeViewIcons/Tool.png",
};

function ReadVector(elu) {
  return {
    X: elu.getElementsByTagName("X")[0].innerHTML,
    Y: elu.getElementsByTagName("Y")[0].innerHTML,
    Z: elu.getElementsByTagName("Z")[0].innerHTML,
  };
}

function makeid(length) {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function ReadColor(elu) {
  return {
    R: elu.getElementsByTagName("R")[0].innerHTML,
    G: elu.getElementsByTagName("G")[0].innerHTML,
    B: elu.getElementsByTagName("B")[0].innerHTML,
    A: elu.getElementsByTagName("A")[0].innerHTML,
  };
}

function GetDisplayProperty(obj) {
  try {
    let propertval = obj;

    if (propertval.tagName == "vector3") {
      let readvectorresult = ReadVector(propertval);
      propertval = `<input type="text" disabled value="${readvectorresult["X"]}, ${readvectorresult["Y"]}, ${readvectorresult["Z"]}">`;
    } else if (propertval.tagName == "color") {
      let readvectorresult = ReadColor(propertval);
      propertval = `<input type="text" disabled value="${readvectorresult["R"]}, ${readvectorresult["G"]}, ${readvectorresult["B"]}, ${readvectorresult["A"]}">`;
    } else if (propertval.tagName == "boolean") {
      if (propertval.innerHTML.toString() == "true") {
        propertval = `<input type="checkbox" disabled checked>`;
      } else {
        propertval = `<input type="checkbox" disabled>`;
      }
    } else {
      propertval = `<input type="text" disabled value="${propertval.innerHTML.toString()}">`;
    }

    return propertval;
  } catch (e) {
    return "Unable to load property.";
  }
}

function GetProperty(obj, PropertyName) {
  try {
    let propertval = obj
      .getElementsByTagName("Properties")[0]
      .querySelectorAll('*[name="' + PropertyName + '"]')[0];

    if (propertval.tagName == "vector3") {
      let readvectorresult = ReadVector(propertval);
      propertval = `${readvectorresult["X"]},${readvectorresult["Y"]},${readvectorresult["Z"]}`;
    }

    if (propertval.tagName == "color") {
      let readvectorresult = ReadColor(propertval);
      propertval = `${readvectorresult["R"]},${readvectorresult["G"]},${readvectorresult["B"]},${readvectorresult["A"]}`;
    }

    return propertval.innerHTML;
  } catch (e) {
    return 'Unable to load Property "' + PropertyName + '"';
  }
}

function GetAllProperties(obj) {
  try {
    let propertval = obj
      .getElementsByTagName("Properties")[0]
      .querySelectorAll("*[name]");

    return propertval;
  } catch (e) {
    return "Unable to load All properties";
  }
}

function GetClass(obj) {
  try {
    return obj.getAttribute("class");
  } catch (e) {
    return "Unable to get class";
  }
}

let CurrentData = [];
let IDPropertiesData = {};
let xmlDoc;
let ModelData;

function RenderItems(par, modelda) {
  Array.from(modelda.childNodes).forEach(function (item) {
    if (item.tagName == "Item") {
      let RanID = makeid(10);

      let processIcon = IconsData["object"];
      let ClassType = GetClass(item);

      if (IconsData[ClassType]) {
        processIcon = IconsData[ClassType];
      }

      CurrentData.push({
        id: RanID,
        parent: par,
        text:
          GetProperty(item, "Name") == 'Unable to load Property "Name"'
            ? GetProperty(item, "name")
            : GetProperty(item, "Name"), // node text
        icon: processIcon, // string for custom
        state: {
          opened: false, // is the node open
          disabled: false, // is the node disabled
          selected: false, // is the node selected
        },
        children: [], // array of strings or objects
        li_attr: {}, // attributes for the generated LI node
        a_attr: {}, // attributes for the generated A node
      });

      if (item.firstChild) {
        RenderItems(RanID, item);
      }

      IDPropertiesData[RanID] = GetAllProperties(item);
    }
  });
}

window.addEventListener("DOMContentLoaded", (event) => {
  let url_string = window.location.href;
  let url = new URL(url_string);
  let targettedID = url.searchParams.get("id");
  let themeuse = url.searchParams.get("theme");
  let explorerHeader = document.getElementById("explorerHeader");
  let propertiesView = document.getElementById("propertiesView");

  if (!targettedID) {
    explorerHeader.innerHTML = "No ID provided";
    return;
  }

  if (!themeuse) {
    document.head.innerHTML += `<link href="themes/light.css" rel="stylesheet">`;
  } else {
    document.head.innerHTML += `<link href="themes/${themeuse}.css" rel="stylesheet">`;
  }

  async function MainFunc() {
    explorerHeader.innerHTML = "Fetching..";
    let responseData;

    try {
      responseData = await fetch(
        "https://api.polytoria.com/v1/models/get-model?id=" + targettedID
      );
    } catch (e) {
      explorerHeader.innerHTML = "Invaild Model";
      return;
    }
    let data = await responseData.text();

    let parser = new DOMParser();
    xmlDoc = parser.parseFromString(data, "text/xml");

    ModelData = xmlDoc.getElementsByTagName("model")[0];

    try {
      RenderItems("#", ModelData);
    } catch {
      explorerHeader.innerHTML = "Error while processing JSON tree.";
      return;
    }

    try {
      $("#jsTree-view")
        .on("changed.jstree", function (e, data) {
          propertiesView.innerHTML = "";
          if (IDPropertiesData[data.selected[0]]) {
            let Located = IDPropertiesData[data.selected[0]];

            Array.from(Located).forEach(function (item) {
              let TemplateProperty = `
                    <div class="propertiesView-Div">
                        <div class="propertyName">
                            <p>${item.getAttribute("name")}&nbsp&nbsp&nbsp</p>
                        </div>

                        <div class="propertyVal">
                        ${GetDisplayProperty(item)}
                        </div>
                    </div>
                    `;

              propertiesView.innerHTML += TemplateProperty;
            });
          }
        })
        .jstree({
          core: {
            data: CurrentData,
          },
        });
    } catch (e) {
      window.location.reload();
    }

    explorerHeader.innerHTML = "Explorer";
  }

  MainFunc();
});
