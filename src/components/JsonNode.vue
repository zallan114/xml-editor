<template>
  <div
    class="tagCard"
    :style="styleObj"
    @mousedown="(event) => changeClass(event)"
    @click="(event) => selectNode(parentKey, event)"
  >
    <div v-show="parentNode">
      <i v-show="!isOpen" @click.stop="expand($event)"
        ><FontAwesomeIcon :icon="faCaretRight"
      /></i>
      <i v-show="isOpen" @click.stop="expand($event)"
        ><FontAwesomeIcon :icon="faCaretDown"
      /></i>

      <p class="cardText text-container">
        {{ parentKey }} <span class="grayColor"> {{ valText }} </span>
      </p>

      <i
        class="floatRight marginRight"
        title="remove"
        @click.stop="handleClickRemove(parentKey)"
        ><FontAwesomeIcon :icon="faClose"
      /></i>

      <i
        class="floatRight marginRight"
        title="addChild"
        @click.stop="addChild()"
        ><FontAwesomeIcon :icon="faPlus"
      /></i>
    </div>

    <template v-if="isOpen">
      <template v-for="k in Object.keys(filteredNode)" :key="k">
        <template v-if="filteredNode[k]">
          <JsonNode
            :node="filteredNode[k]"
            :parentKey="k"
            :parentNode="node"
            @remove="removeThisTag"
            @selectNode="selectNode"
          />
        </template>
      </template>
    </template>

    <ModalWindow
      v-if="showModal"
      @close="showModal = false"
      @submit="handleSubmit"
    />
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
import { defineComponent, PropType, computed } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { eventBus } from "../utils/eventBus";
import { NodeKv } from "../utils/utils";
import ModalWindow from "./ModalWindow.vue";

import {
  faCaretRight,
  faCaretDown,
  faPlus,
  faClose,
} from "@fortawesome/free-solid-svg-icons";

export default defineComponent({
  name: "JsonNode",
  components: { FontAwesomeIcon, ModalWindow },
  props: {
    node: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    parentNode: {
      type: Object as PropType<Record<string, any>>,
    },
    parentKey: {
      type: String || undefined,
    },
  },

  emits: ["selectNode", "remove"],
  setup(props, { emit }) {
    let isOpen = ref(true);

    const showModal = ref(false);
    let modalResult = {
      nodeName: "",
      nodeType: "",
      nodeValue: "",
    };

    const handleSubmit = (data: any) => {
      modalResult = data;

      const parent = props.node || {};
      //add sub node here

      eventBus.emit("add-tag", parent);

      //needs to know if this node is Array
      if (parent[modalResult.nodeName]) {
        if (Array.isArray(parent[modalResult.nodeName])) {
          if (modalResult.nodeType === "_text") {
            parent[modalResult.nodeName].push({ _text: modalResult.nodeValue });
          } else if (modalResult.nodeType === "_cdata") {
            parent[modalResult.nodeName].push({
              _cdata: modalResult.nodeValue,
            });
          } else {
            parent[modalResult.nodeName].push({});
          }
        } else {
          const rst = window.confirm(
            "The node name you are trying to add already exists, override it？"
          );
          if (rst) {
            parent[modalResult.nodeName] = {};
          } else {
            return;
          }
        }
      } else {
        if (modalResult.nodeType === "_text") {
          parent[modalResult.nodeName] = { _text: modalResult.nodeValue };
        } else if (modalResult.nodeType === "_cdata") {
          parent[modalResult.nodeName] = { _cdata: modalResult.nodeValue };
        }
      }
    };

    const addChild = () => {
      showModal.value = true;
      //isOpen.value = true;
    };

    onMounted(() => {
      //
    });

    const valText = computed(() => {
      const value = props.node;
      return value._text ? value._text : value._cdata ? value._cdata : "";
    });

    const filteredNode = computed(() => {
      let acc: Record<string, any> = {};

      if (Array.isArray(props.node)) {
        props.node.forEach((subValue, index) => {
          acc[`${props.parentKey}[${index}]`] = subValue;
        });
      } else {
        const filteredKeys = Object.keys(props.node).filter(
          (k) => !k.startsWith("_")
        );
        filteredKeys.forEach((subKey) => {
          let subNode: Record<string, any> = {};
          subNode = props.node[subKey];
          if (Array.isArray(subNode)) {
            subNode.forEach((sv, index) => {
              acc[`${subKey}[${index}]`] = sv;
            });
          } else {
            acc[subKey] = subNode;
          }
        });
      }

      return acc;
    });

    const hasChild = computed((): boolean => {
      for (const [key, value] of Object.entries(props.node)) {
        if (!key.startsWith("_")) {
          // Check if value represents a child element.
          // This depends on what the structure of value is.
          // For example, if value is an object and not null or undefined, it could be considered a child.
          if (value && typeof value === "object") {
            return true;
          }
        }
      }
      return false;
    });

    const expand = (event: Event) => {
      event.stopPropagation();
      isOpen.value = !isOpen.value;
    };

    const changeClass = (event: Event) => {
      // css change
      const allElements = document.querySelectorAll(".tagCard");
      allElements.forEach((element) => {
        element.classList.remove("tagCardSelected");
      });

      const target = event.target as HTMLElement;

      if (target && target.classList.contains("tagCard")) {
        target.classList.toggle("tagCardSelected");
      }

      const parent = target.parentElement as HTMLElement;
      if (parent && parent.classList.contains("tagCard")) {
        parent.classList.toggle("tagCardSelected");
      }
    };

    //const selectNode = (attributes: Record<string, any>) => {

    const currTextNodeKv = ref<NodeKv>({});
    const selectNode = (parentKey: string, event: Event) => {
      if (!event) {
        return;
      }

      event.stopPropagation(); // Stop the event from bubbling up

      const value = props.node;

      //add the text node together
      currTextNodeKv.value.key = parentKey;
      currTextNodeKv.value.text = value._text
        ? value._text
        : value._cdata
        ? value._cdata
        : "";
      currTextNodeKv.value.value = value;
      currTextNodeKv.value.parent = props.parentNode;

      eventBus.emit("edit-text-node", currTextNodeKv.value);

      //this can work, but only to parent (if nested deeply)
      //emit("selectNode", attributes);

      //Props in Vue are designed to be a one - way data - binding mechanism
      //from the parent component to the child component.
      //Mutating a prop directly inside a child component violates the principle of
      //unidirectional data flow.
      if (!props.node._attributes) {
        const newAttr: Record<string, any> = { _attributes: {} };
        //props.node._attributes = newAttr;
        Object.assign(props.node, newAttr);
      }

      //this can emit to top parent
      eventBus.emit("select_node", props.node._attributes);
    };

    const styleObj = computed(() => {
      if (isOpen.value) {
        return {
          height: "auto",
          "line-height": "normal",
          "overflow-y": "none",
        };
      } else {
        return {};
      }
    });

    const handleClickRemove = (key: string) => {
      emit("remove", key);
    };

    const deleteByKey = (obj: Record<string, any>, key: string) => {
      //Array Key
      if (key.indexOf("[") > 0) {
        const realKey = key.substring(0, key.indexOf("["));
        const indexNum = Number(
          key.substring(key.indexOf("[") + 1, key.indexOf("]"))
        );
        for (const k in obj) {
          if (k === realKey) {
            const arrayToModify = obj[k];
            arrayToModify.forEach(
              (value: Record<string, any>, index: number) => {
                if (index == indexNum) {
                  arrayToModify.splice(indexNum, 1);
                  return;
                }
              }
            );
          }
        }
      }

      //for normal key
      for (const k in obj) {
        if (k === key) {
          delete obj[k];
          return;
        } else if (typeof obj[k] === "object") {
          // If the value is another object, recursively call the function.
          deleteByKey(obj[k], key);
        }
      }
    };

    const removeThisTag = (key: string) => {
      eventBus.emit("clear-attributes", key);
      deleteByKey(props.node, key);
    };

    return {
      isOpen,
      filteredNode,
      selectNode,
      faCaretRight,
      faCaretDown,
      faPlus,
      faClose,
      hasChild,
      styleObj,
      expand,
      changeClass,
      currTextNodeKv,
      addChild,
      handleClickRemove,
      removeThisTag,
      valText,
      showModal,
      handleSubmit,
    };
  },
});
</script>

<style scoped></style>
