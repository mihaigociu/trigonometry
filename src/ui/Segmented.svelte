<script lang="ts" generics="T extends string | number">
  /** A row of pill buttons where exactly one is chosen (tabs, function pickers). */
  interface Props {
    label: string;
    options: { value: T; label: string; color?: string }[];
    value: T;
    onchange?: (value: T) => void;
  }

  let { label, options, value = $bindable(), onchange }: Props = $props();
</script>

<div class="seg" role="radiogroup" aria-label={label}>
  {#each options as o (o.value)}
    <button
      type="button"
      role="radio"
      aria-checked={o.value === value}
      style:--c={o.color ?? 'var(--brand)'}
      onclick={() => {
        value = o.value;
        onchange?.(o.value);
      }}>{o.label}</button
    >
  {/each}
</div>

<style>
  .seg {
    display: flex;
    gap: var(--space-1);
    padding: var(--space-1);
    border-radius: 999px;
    background: var(--surface-raised);
    box-shadow: inset 0 0 0 1px var(--border);
  }

  button {
    flex: 1;
    min-height: calc(var(--touch) - 8px);
    padding-inline: var(--space-3);
    border: 0;
    border-radius: 999px;
    background: none;
    color: var(--ink-2);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
  }

  button[aria-checked='true'] {
    background: var(--c);
    color: #fff;
  }
</style>
