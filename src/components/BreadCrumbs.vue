<template>
  <div class="breadcrumb">
    <span v-if="showVisitedPages"></span>
    <select v-if="showVisitedPages" v-model="selectedVisitedPage" @change="onVisitedPageChange($event.target.value)">
      <option v-for="page in visitedPagesOptions" :value="page.value">{{ page.label }}</option>
    </select>
    <span v-if="showEntityTitle" class="breadcrumb-divider"> > </span>
    <span v-if="showEntityTitle" class="breadcrumb-item">{{ entityTitle }}</span>
  </div>
</template>

<script>
import { useBreadcrumb } from '@/composables/useBreadcrumb'

export default {
  name: 'Breadcrumb',
  mounted() {
    const lastBreadcrumbItem = document.querySelector('.breadcrumb-item:last-child')
    if (lastBreadcrumbItem) {
      lastBreadcrumbItem.classList.add('breadcrumb-item--active')
    }
  },
  setup() {
    const {
      visitedPagesOptions,
      selectedVisitedPage,
      showVisitedPages,
      entityTitle,
      showEntityTitle,
      addVisitedPage,
      clearVisitedPages,
      onVisitedPageChange,
      pageInfo
    } = useBreadcrumb()

    return {
      visitedPagesOptions,
      selectedVisitedPage,
      showVisitedPages,
      entityTitle,
      showEntityTitle,
      addVisitedPage,
      clearVisitedPages,
      onVisitedPageChange,
      pageInfo
    }
  },
}
</script>

<style>
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.breadcrumb-divider {
  color: #ccc;
  margin: 0 5px;
}

.breadcrumb-item {
  display: inline-block;
  font-size: 0.875rem;
  margin-right: 0.5rem;
}

.breadcrumb-item:not(:last-child)::after {
  display: inline-block;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  color: #6c757d;
  content: "/";
}

.breadcrumb-item--active {
  color: #6c757d;
}

.breadcrumb a {
  color: #6c757d;
}

select {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: 1px solid #ccc;
  font-size: 1rem;
  margin-left: 0.5rem;
}
</style>
