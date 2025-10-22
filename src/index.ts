/**
 * @ldesign/mindmap - 思维导图
 */
export class MindMap {
  constructor(private container: HTMLElement) { }
  render() { console.info('MindMap rendering') }
}
export function createMindMap(container: HTMLElement) { return new MindMap(container) }

