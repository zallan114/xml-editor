import { defineComponent, ref, onMounted, computed } from "vue";
import JsonNode from "../components/JsonNode.vue";
import JsonAttributes from "../components/JsonAttributes.vue";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faPlus, faCheck } from "@fortawesome/free-solid-svg-icons";
import { eventBus } from "../utils/eventBus";
import { UtilityClass, NodeKv } from "../utils/utils";

export default defineComponent({
  name: "JsonEditorComponent",
  components: { JsonNode, FontAwesomeIcon, JsonAttributes },
  setup() {
    const historyObject: any[] = [];

    const fileName = ref("Import File");
    const isAddAttr = ref(false);

    //xml element node
    const currTextNodeKv = ref<NodeKv>({});

    //attributes of currrent xml element node
    const selectedAttributes: Record<string, any> = ref({});

    const newAttrName = ref("newName1");
    const newAttrValue = ref("newValue1");

    const hasChildNode = computed((): boolean => {
      if (!currTextNodeKv.value || !currTextNodeKv.value.value) {
        return false;
      }
      for (const [key, value] of Object.entries(currTextNodeKv.value.value)) {
        if (!key.startsWith("_")) {
          if (value && typeof value === "object") {
            return true;
          }
        }
      }
      return false;
    });

    const readXML = (event: Event) => {
      const target = event.target as HTMLInputElement | null;
      if (target && target.files && target.files[0]) {
        const file = target.files[0];
        fileName.value = file.name;

        if (file.type === "text/xml") {
          const reader = new FileReader();
          reader.onload = (e) => {
            const fileContent = (e.target as FileReader).result as string;
            jsonData.value = UtilityClass.xmlDomToJson(fileContent);
          };
          reader.readAsText(file);
        } else {
          alert("Please select a valid XML file.");
        }
      } else {
        alert("No file selected or invalid file type.");
      }
    };

    const exportXML = () => {
      const result = UtilityClass.jsonToXml(jsonData.value);
      UtilityClass.export_raw("file.xml", result);
    };

    const undo = () => {
      if (historyObject.length == 0) {
        alert("no history found!");
        return;
      }

      jsonData.value = historyObject.pop();
      clearAttr();
    };

    const removeNode = () => {
      record();
    };

    const clearAttr = () => {
      currTextNodeKv.value = {};
      selectedAttributes.value = {};
    };

    const editAttribute = (data: any) => {
      record();
      switch (data.editWay) {
        case "remove":
          if (
            currTextNodeKv.value &&
            currTextNodeKv.value.key &&
            data.name == currTextNodeKv.value.key
          ) {
            alert("Node Name should not be removed !");
            return;
          }
          delete selectedAttributes.value[data.name];
          break;
        case "change":
          if (
            currTextNodeKv.value &&
            currTextNodeKv.value.key &&
            data.name == currTextNodeKv.value.key
          ) {
            currTextNodeKv.value.text = data.value;

            //update value self
            updateElementNode();
          } else {
            selectedAttributes.value[data.name] = data.value;
          }
      }
    };

    const record = () => {
      const a = UtilityClass.deepCopy(jsonData.value);
      historyObject.push(a);
      //I think storing 10 records is enough
      if (historyObject.length > 10) {
        historyObject.shift();
      }
    };

    const updateElementNode = () => {
      if (currTextNodeKv.value && currTextNodeKv.value.value) {
        if (currTextNodeKv.value.value._cdata) {
          currTextNodeKv.value.value._cdata = currTextNodeKv.value.text;
        } else {
          currTextNodeKv.value.value._text = currTextNodeKv.value.text;
        }
      }
    };

    const saveNewAttr = () => {
      record();
      //attributes
      if (!selectedAttributes.value) {
        const newAttr: Record<string, any> = {};
        newAttr[newAttrName.value] = newAttrValue.value;
        selectedAttributes.value = newAttr;
      } else {
        selectedAttributes.value[newAttrName.value] = newAttrValue.value;
      }
      //text or cdata
      updateElementNode();
      isAddAttr.value = false;
    };

    const jsonData = ref({});

    

    onMounted(() => {
      // Code to run when the component is mounted
      console.log("Component is mounted.");
      eventBus.on("edit-text-node", editTextNode);
      eventBus.on("select_node", updateAttributes);
      eventBus.on("add-tag", addTag);
      eventBus.on("clear-attributes", removeNode);
    });

    const importSample = () => {
      jsonData.value = {
        "rpc-reply": {
          _attributes: {
            "message-id": "55911",
            xmlns: "urn:ietf:params:xml:ns:netconf:base:1.0",
          },
          ratPriority: [
            {
              Name: {
                _text: "cell10",
              },
              rat: {
                _text: "UTRA_FDD",
              },
              priority: {
                _text: "0",
              },
            },
            {
              Name: {
                _text: "cell11",
              },
              rat: {
                _text: "UTRA_TDD",
              },
              priority: {
                _text: "1",
              },
            },
          ],
          data: {
            abc: {
              result: {
                _text: "SUCCESS",
              },
            },
            "remote-command": {
              _attributes: {
                xmlns: "urn:cmpt-remote-command",
              },
              "remote-command-request": {
                result: {
                  _text: "SUCCESS",
                },
                "result-info": {
                  _cdata:
                    '\r\n <sys xmlns="urn:1.4.1.0">\r\n </sys>\r\n ',
                },
              },
            },
          },
        },
      };

    }

    const addTag = (data: any) => {
      record();
      if (data._text) {
        delete data._text;
      }
      if (data._cdata) {
        delete data._cdata;
      }

    };

    const isCurrTextNodeKvNotEmpty = computed(() => {
      return Object.keys(currTextNodeKv.value).length !== 0;
    });
    const editTextNode = (kv: NodeKv) => {
      currTextNodeKv.value = kv;
    };

    const updateAttributes = (attributes: Record<string, any>) => {
      selectedAttributes.value = attributes;
    };

    const removeRoot = () => {
      record();
      jsonData.value = { tips: { _text: "Please import an xml for edit..." } };
      clearAttr();
    };

    return {
      jsonData,
      selectedAttributes,
      currTextNodeKv,
      isCurrTextNodeKvNotEmpty,
      updateAttributes,
      faPlus,
      faCheck,
      fileName,
      isAddAttr,
      newAttrName,
      newAttrValue,
      saveNewAttr,
      editAttribute,
      removeRoot,
      undo,
      readXML,
      exportXML,
      hasChildNode,
      importSample,
    };
  },
});
