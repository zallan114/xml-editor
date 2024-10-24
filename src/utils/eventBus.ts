import mitt from 'mitt';

type Events = {
  'click-tag': any;
  'get-data': any;
  'clear-attributes': any;
  'add-tag': any;
  'edit-happen': any;
  'edit-text-node': any;
  'select_node': any;
  'remove': any;
};

export const eventBus = mitt<Events>();