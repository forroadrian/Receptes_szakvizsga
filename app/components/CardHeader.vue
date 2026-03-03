<template>
    <div class="d-flex justify-content-between align-items-start card-header gap-2">
        <div class="card-header-title flex-grow-1">
            <slot></slot>
        </div>        
        <div v-if="$slots.actions" class="card-header--actions flex-shrink-0">
            <slot name="actions"></slot>
        </div>
    </div>
</template>