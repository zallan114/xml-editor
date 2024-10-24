<template>
  <div style="display: flex">
    <p class="inline" v-show="!isEdit">{{ name }} : {{ value }}</p>
    <i class="fa fa-close" v-show="!hasSubNode" title="remove" @click="remove"
      ><FontAwesomeIcon :icon="faClose"
    /></i>
    <i class="fa fa-edit" v-show="!hasSubNode" title="edit" @click="edit"
      ><FontAwesomeIcon :icon="faEdit"
    /></i>
    <div v-show="isEdit" class="nodeEdit">
      <input autofocus="autofocus" :value="value" ref="input" />
      <i class="fa fa-check" @click="change"
        ><FontAwesomeIcon :icon="faCheck"
      /></i>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faEdit,
  faCheck,
  faPlus,
  faClose,
} from "@fortawesome/free-solid-svg-icons";

export default {
  name: "JsonAttributes",
  components: {
    FontAwesomeIcon,
  },
  props: {
    value: String,
    name: String,
    hasSubNode: Boolean,
  },
  data() {
    return {
      isEdit: false,
      faEdit,
      faCheck,
      faPlus,
      faClose,
    };
  },

  methods: {
    remove() {
      this.$emit("edit", {
        editWay: "remove",
        name: this.name,
        value: this.value,
      });
    },
    edit() {
      this.isEdit = true;
    },
    change() {
      console.log("change...");
      if (this.$refs.input.value == "") {
        alert("Please input some value!");
        return;
      }
      this.$emit("edit", {
        editWay: "change",
        name: this.name,
        value: this.$refs.input.value,
      });
      this.isEdit = false;
    },
  },
};
</script>

<style scoped></style>
