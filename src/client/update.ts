import { ComponentController, ConfigApi, PlatformApi, ProxyElement } from '../util/interfaces';
import { generateVNode } from './host';
import { initProps } from './proxy';
import { RendererApi } from '../util/interfaces';


export function queueUpdate(plt: PlatformApi, config: ConfigApi, renderer: RendererApi, elm: ProxyElement, ctrl: ComponentController, tag: string) {
  // only run patch if it isn't queued already
  if (!ctrl.queued) {
    ctrl.queued = true;

    // run the patch in the next tick
    plt.nextTick(function queueUpdateNextTick() {

      // vdom diff and patch the host element for differences
      update(plt, config, renderer, elm, ctrl, tag);

      // no longer queued
      ctrl.queued = false;
    });
  }
}


export function update(plt: PlatformApi, config: ConfigApi, renderer: RendererApi, elm: ProxyElement, ctrl: ComponentController, tag: string) {
  const cmpMeta = plt.getComponentMeta(tag);

  let instance = ctrl.instance;
  if (!instance) {
    instance = ctrl.instance = new cmpMeta.componentModule();
    initProps(plt, config, renderer, elm, ctrl, tag, cmpMeta.props);
  }

  if (!ctrl.rootElm) {
    const cmpMode = cmpMeta.modes[instance.mode];
    const cmpModeId = `${tag}.${instance.mode}`;
    ctrl.rootElm = plt.$attachShadow(elm, cmpMode, cmpModeId);
  }

  const vnode = generateVNode(ctrl.rootElm, instance, cmpMeta.hostCss);

  // if we already have a vnode then use it
  // otherwise, elm is the initial patch and
  // we need it to pass it the actual host element
  ctrl.vnode = renderer(ctrl.vnode ? ctrl.vnode : elm, vnode);
}