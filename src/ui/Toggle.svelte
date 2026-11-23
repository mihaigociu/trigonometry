<script lang="ts">
  /** On/off switch with a label, big enough for fingers. */
  interface Props {
    label: string;
    checked: boolean;
    color?: string;
    onchange?: (checked: boolean) => void;
  }

  let { label, checked = $bindable(), color = 'var(--brand)', onchange }: Props = $props();
</script>

<button
  type="button"
  class="switch"
  role="switch"
  aria-checked={checked}
  style:--c={color}
  onclick={() => {
    checked = !checked;
    onchange?.(checked);
  }}
>
  <span class="track" aria-hidden="true"><span class="thumb"></span></span>
  <span>{label}</span>
</button>

<style>
  .switch {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    min-height: var(--touch);
    padding: 0;
    border: 0;
    background: none;
    color: var(--ink);
    font: inherit;
    cursor: pointer;
    text-align: left;
  }

  .track {
    flex: none;
    width: 52px;
    height: 30px;
    border-radius: 15px;
    background: #b9b9b4;
    position: relative;
    transition: background 0.15s;
  }

  .thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.3);
    transition: translate 0.15s;
  }

  .switch[aria-checked='true'] .track {
    background: var(--c);
  }

  .switch[aria-checked='true'] .thumb {
    translate: 22px 0;
  }
</style>
