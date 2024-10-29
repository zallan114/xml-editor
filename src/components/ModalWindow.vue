<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="top-right-text winTitle" @click="closeModal">
        X&nbsp;&nbsp;
      </div>

      <div class="controls">
        <div>
          <span class="mLabel">Node Name: </span>
          <input
            v-model="nodeName"
            class="mControl"
            type="text"
            autofocus="autofocus"
            placeholder=""
          />
        </div>
        <div>
          <span class="mLabel">Node Type: </span>
          <select v-model="nodeType" class="mControl">
            <option value="_text">Text</option>
            <option value="_cdata">CDATA</option>
            <option value="_node">Node</option>
          </select>
        </div>
        <div v-if="showText">
          <span class="mLabel">Node Value: </span>
          <input
            ref="nodeValueInput"
            v-model="nodeValue"
            type="text"
            class="mControl"
            placeholder="please input text value for this node..."
          />
        </div>
        <div>
          <button @click="submit" class="mControl">Submit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModalWindow",
  data() {
    return {
      nodeName: "",
      nodeType: "_node",
      nodeValue: "",
    };
  },
  computed: {
    showText() {
      return this.nodeType !== "_node";
    },
  },
  watch: {
    nodeType(newVal) {
      if (newVal !== "_node") {
        this.$nextTick(() => {
          this.$refs.nodeValueInput.focus();
        });
      }
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    submit() {
      if (this.nodeName == "") {
        alert("please input a node name.");
        return;
      }

      this.$emit("submit", {
        nodeName: this.nodeName,
        nodeType: this.nodeType,
        nodeValue: this.nodeValue,
      });
      this.closeModal();
    },
  },
};


/**
 VUE3 style:


  const nodeValueInput = ref(null);
  watch(nodeType, (newValue) => {
      if (newValue === '_text') {
        nextTick(() => {
          if (nodeValueInput.value) {
            nodeValueInput.value.focus();
          }
        });
      } 
    });

*/
</script>

<style scoped>
@import "../assets/xml-editor.css";
</style>
