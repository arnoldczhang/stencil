import { ComponentController, ComponentInstance, ComponentMeta, ProxyElement } from '../../../utils/interfaces';
import { attributeChangedCallback } from '../../../element/attribute-changed';
import { update } from '../../../element/update';
import { disconnectedCallback } from '../../../element/disconnected';
import { Config } from '../../../utils/config';
import { PlatformApi } from '../../../platform/platform-api';
import { PlatformClient } from '../../../platform/platform-client';
import { initRenderer, attributesModule, classModule } from '../../../renderer/core';

// declared in the base iife arguments
declare const components: ComponentMeta[];


const plt = new PlatformClient(window, document);
const config = new Config();
const renderer = initRenderer([
  attributesModule,
  classModule
], plt);

const ctrls = new WeakMap<HTMLElement, ComponentController>();


components.forEach(function registerComponentMeta(cmpMeta) {
  plt.registerComponent(cmpMeta);

  window.customElements.define(cmpMeta.tag, class extends HTMLElement {

    constructor() {
      super();
      ctrls.set(this, {});
    }

    connectedCallback() {
      const elm: ProxyElement = this;
      plt.loadComponentModule(cmpMeta.tag, function loadedModule(cmpModule) {
        update(plt, config, renderer, elm, ctrls.get(elm), cmpMeta, cmpModule);
      });
    }

    attributeChangedCallback(attrName: string, oldVal: string, newVal: string, namespace: string) {
      attributeChangedCallback(ctrls.get(this).instance, cmpMeta, attrName, oldVal, newVal, namespace);
    }

    disconnectedCallback() {
      disconnectedCallback(ctrls.get(this));
      ctrls.delete(this);
    }

    static get observedAttributes() {
      return cmpMeta.observedAttributes;
    }
  });
});
