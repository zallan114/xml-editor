<template>
  <div class="container">
    <div class="alignLeft">
      <div class="headButton">
        <p ref="importButtonText" class="buttonText">{{ fileName }}</p>
        <input
          ref="fileInput"
          type="file"
          accept="application/xml"
          @change="readXML"
        />
      </div>

      <div class="headButton">
        <p class="buttonText" @click="exportXML">Export Files</p>
      </div>

      <div class="headButton">
        <p class="buttonText" @click="importSample">SampleData</p>
      </div>
      <div class="headButton floatRight">
        <p class="buttonText" @click="undo">Undo</p>
      </div>
    </div>

    <div>
      <div id="attributes" class="sticky-window">
        <header class="winTitle">Attribute</header>

        <div id="newAttribute">
          <i
            class="fa fa-plus"
            title="click to add new attribute"
            @click="isAddAttr = true"
            ><FontAwesomeIcon :icon="faPlus" />
          </i>
          <div v-if="isAddAttr">
            <div>
              <input v-model="newAttrName" />
            </div>
            <div>
              <input v-model="newAttrValue" />
            </div>
            <i class="fa fa-check">
              <FontAwesomeIcon :icon="faCheck" @click="saveNewAttr" />
            </i>
          </div>
        </div>

        <div id="attributeList">
          <JsonAttributes
            class="attributeDiv"
            v-if="isCurrTextNodeKvNotEmpty"
            :hasSubNode="hasChildNode"
            :key="currTextNodeKv.key"
            :value="currTextNodeKv.text"
            :name="currTextNodeKv.key"
            v-on:edit="editAttribute"
          >
          </JsonAttributes>

          <JsonAttributes
            class="attributeDiv"
            :hasSubNode="false"
            v-for="(value, key) of selectedAttributes"
            :key="key"
            :value="value"
            :name="key"
            v-on:edit="editAttribute"
          >
          </JsonAttributes>
        </div>
      </div>

      <div id="tags">
        <JsonNode
          :node="jsonData"
          :parentKey="Object.keys(jsonData)[0]"
          @selectNode="updateAttributes"
          @remove="removeRoot"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
@import "../assets/xml-editor.css";
</style>

<script lang="ts" src="./json-editor.component.ts"></script>
