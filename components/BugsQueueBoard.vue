<template>
  <div id="bugs-queue-board" class="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
    <!-- Two Column Layout -->
    <div id="bugs-main-layout" class="flex-1 flex gap-4 overflow-hidden bg-gray-50 dark:bg-gray-900">
      <!-- Left Panel: Bug List - Level 1 (Lightest) -->
      <div id="bugs-list-panel" class="w-96 flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <!-- Search Bar - Level 2 -->
        <div id="bugs-search-container" class="flex-none p-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input
                id="bugs-search-input"
                v-model="searchQuery"
                type="text"
                placeholder="Search for bugs..."
                class="w-full px-4 py-2.5 pl-10 pr-4 text-sm border rounded-lg 
                       bg-white dark:bg-gray-800 
                       border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-gray-100
                       focus:ring-[#5bbcaa] focus:border-[#5bbcaa] focus:ring-2 focus:outline-none"
              />
              <div id="bugs-search-icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-search text-gray-400"></i>
              </div>
            </div>
            
            <!-- Toggle Filters Button -->
            <button
              @click="showFilters = !showFilters"
              class="h-[42px] px-3 rounded-lg transition-all flex items-center justify-center gap-1.5"
              :class="[
                showFilters
                  ? 'bg-[#5bbcaa] text-white hover:bg-[#4ca899]'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
              :title="showFilters ? 'Hide Filters' : 'Show Filters'"
            >
              <i class="fas fa-filter text-sm"></i>
              <i :class="['fas fa-chevron-down text-[10px] transition-transform', showFilters ? 'rotate-180' : '']"></i>
            </button>
          </div>
        </div>
        
        <!-- Sort and Filter Bar - Level 2 (Collapsible) -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-40 opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="max-h-40 opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-if="showFilters" id="sort-filter-bar" class="flex-none overflow-hidden bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
            <div class="p-3 space-y-3">
              <!-- Priority Filter -->
              <div>
                <label class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Priority</label>
                <div class="grid grid-cols-5 gap-1.5">
                  <button
                    @click="priorityFilter = 'all'"
                    class="px-2 py-1.5 text-xs font-medium rounded transition-colors"
                    :class="[
                      priorityFilter === 'all'
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                  >
                    All
                  </button>
                  <button
                    @click="priorityFilter = 'Critical'"
                    class="px-2 py-1.5 text-xs font-medium rounded transition-colors"
                    :class="[
                      priorityFilter === 'Critical'
                        ? 'bg-red-200 dark:bg-red-900/40 text-red-900 dark:text-red-100'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                  >
                    Critical
                  </button>
                  <button
                    @click="priorityFilter = 'High'"
                    class="px-2 py-1.5 text-xs font-medium rounded transition-colors"
                    :class="[
                      priorityFilter === 'High'
                        ? 'bg-orange-200 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                  >
                    High
                  </button>
                  <button
                    @click="priorityFilter = 'Medium'"
                    class="px-2 py-1.5 text-xs font-medium rounded transition-colors"
                    :class="[
                      priorityFilter === 'Medium'
                        ? 'bg-yellow-200 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                  >
                    Medium
                  </button>
                  <button
                    @click="priorityFilter = 'Low'"
                    class="px-2 py-1.5 text-xs font-medium rounded transition-colors"
                    :class="[
                      priorityFilter === 'Low'
                        ? 'bg-green-200 dark:bg-green-900/40 text-green-900 dark:text-green-100'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                  >
                    Low
                  </button>
                </div>
              </div>
              
              <!-- Sort Options -->
              <div>
                <label class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Sort By</label>
                <div class="grid grid-cols-2 gap-1.5">
                  <button
                    @click="sortOption = 'priority-high'"
                    class="px-2 py-1.5 text-xs font-medium rounded transition-colors text-left"
                    :class="[
                      sortOption === 'priority-high'
                        ? 'bg-[#5bbcaa] text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                  >
                    <i class="fas fa-arrow-down text-xs mr-1.5"></i>
                    Priority: High → Low
                  </button>
                  <button
                    @click="sortOption = 'priority-low'"
                    class="px-2 py-1.5 text-xs font-medium rounded transition-colors text-left"
                    :class="[
                      sortOption === 'priority-low'
                        ? 'bg-[#5bbcaa] text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                  >
                    <i class="fas fa-arrow-up text-xs mr-1.5"></i>
                    Priority: Low → High
                  </button>
                  <button
                    @click="sortOption = 'date-latest'"
                    class="px-2 py-1.5 text-xs font-medium rounded transition-colors text-left"
                    :class="[
                      sortOption === 'date-latest'
                        ? 'bg-[#5bbcaa] text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                  >
                    <i class="fas fa-calendar-alt text-xs mr-1.5"></i>
                    Most Recent
                  </button>
                  <button
                    @click="sortOption = 'date-earliest'"
                    class="px-2 py-1.5 text-xs font-medium rounded transition-colors text-left"
                    :class="[
                      sortOption === 'date-earliest'
                        ? 'bg-[#5bbcaa] text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                  >
                    <i class="fas fa-calendar-alt text-xs mr-1.5"></i>
                    Oldest
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
        
        <!-- Status Tabs - Level 2 -->
        <div id="status-tabs-container" class="flex-none p-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
          <div id="status-tabs-grid" class="grid grid-cols-2 gap-2">
            <button
              id="tab-not-started"
              @click="activeStatus = 'notStarted'"
              class="px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              :class="[
                activeStatus === 'notStarted'
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <i class="fas fa-circle-dot text-xs text-gray-500 dark:text-gray-400"></i>
              <span class="truncate">Not Started</span>
              <span id="tab-not-started-count" class="px-1.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ml-auto"
                    :class="[activeStatus === 'notStarted' ? 'bg-gray-400 dark:bg-gray-500' : 'bg-gray-200 dark:bg-gray-700']">
                {{ bugsByStatus.notStarted.length }}
              </span>
            </button>
            
            <button
              id="tab-in-development"
              @click="activeStatus = 'inDevelopment'"
              class="px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              :class="[
                activeStatus === 'inDevelopment'
                  ? 'bg-orange-200 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <i class="fas fa-code text-xs text-orange-600 dark:text-orange-400"></i>
              <span class="truncate">In Development</span>
              <span id="tab-in-development-count" class="px-1.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ml-auto"
                    :class="[activeStatus === 'inDevelopment' ? 'bg-orange-300 dark:bg-orange-800' : 'bg-gray-200 dark:bg-gray-700']">
                {{ bugsByStatus.inDevelopment.length }}
              </span>
            </button>
            
            <button
              id="tab-resolved"
              @click="activeStatus = 'resolved'"
              class="px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              :class="[
                activeStatus === 'resolved'
                  ? 'bg-green-200 dark:bg-green-900/40 text-green-900 dark:text-green-100'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <i class="fas fa-check-circle text-xs text-green-600 dark:text-green-400"></i>
              <span class="truncate">Resolved</span>
              <span id="tab-resolved-count" class="px-1.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ml-auto"
                    :class="[activeStatus === 'resolved' ? 'bg-green-300 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700']">
                {{ bugsByStatus.resolved.length }}
              </span>
            </button>
            
            <button
              id="tab-cancelled"
              @click="activeStatus = 'cancelled'"
              class="px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              :class="[
                activeStatus === 'cancelled'
                  ? 'bg-red-200 dark:bg-red-900/40 text-red-900 dark:text-red-100'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <i class="fas fa-times-circle text-xs text-red-600 dark:text-red-400"></i>
              <span class="truncate">Cancelled</span>
              <span id="tab-cancelled-count" class="px-1.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ml-auto"
                    :class="[activeStatus === 'cancelled' ? 'bg-red-300 dark:bg-red-800' : 'bg-gray-200 dark:bg-gray-700']">
                {{ bugsByStatus.cancelled.length }}
              </span>
            </button>
          </div>
        </div>
        
        <!-- Bug List Items - Level 1 Background -->
        <div id="bugs-list-content" class="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
          <div v-if="currentStatusBugs.length > 0" id="bugs-list" class="divide-y divide-gray-200 dark:divide-gray-700">
            <button
              v-for="bug in currentStatusBugs"
              :key="bug.id"
              :id="`bug-item-${bug.id}`"
              @click="selectBug(bug)"
              class="w-full px-4 py-4 text-left transition-colors relative border-l-4"
              :class="[
                selectedBug?.id === bug.id 
                  ? 'bg-[#5bbcaa]/10 dark:bg-[#5bbcaa]/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-750'
              ]"
              :style="{ borderLeftColor: bug.priorityColor || '#cbd5e1' }"
            >
              <div class="flex items-center gap-3 min-h-[48px]">
                <!-- Bug Name (Centered Vertically) -->
                <div class="flex-1 min-w-0">
                  <p :id="`bug-name-${bug.id}`" class="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ bug.name }}
                  </p>
                </div>
                
                <!-- Chevron Icon -->
                <i :id="`bug-chevron-${bug.id}`" class="fas fa-chevron-right text-gray-400 text-sm flex-shrink-0"></i>
              </div>
              
              <!-- Bottom Right: Attachment & Comment Icons -->
              <div v-if="hasAttachments(bug) || bug.updates.length > 0" class="absolute bottom-2 right-4 flex items-center gap-1.5 h-5">
                <i v-if="hasImages(bug)" class="fas fa-image text-blue-500 text-sm" title="Has images"></i>
                <i v-if="hasVideos(bug)" class="fas fa-video text-purple-500 text-sm" title="Has videos"></i>
                <i v-if="bug.updates.length > 0" class="fas fa-comment text-gray-400 text-sm" :title="`${bug.updates.length + bug.updates.reduce((s, u) => s + (u.replies?.length || 0), 0)} comment(s)`"></i>
              </div>
            </button>
          </div>
          
          <!-- Empty State -->
          <div v-else id="bugs-list-empty" class="flex flex-col items-center justify-center h-full p-6 text-center">
            <i id="bugs-list-empty-icon" class="fas fa-bug text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
            <p id="bugs-list-empty-text" class="text-sm text-gray-500 dark:text-gray-400">
              {{ searchQuery ? 'No bugs found' : 'No bugs available' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Right Panel: Bug Details - Level 1 (Lightest) -->
      <div id="bug-details-panel" class="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div v-if="selectedBug" :id="`bug-detail-${selectedBug.id}`" class="h-full flex flex-col">
          <!-- Detail Header - Level 2 -->
          <div id="bug-detail-header" class="flex-none px-6 py-5 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
            <div id="bug-detail-header-wrapper" class="flex items-start justify-between gap-4">
              <div id="bug-detail-header-left" class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-3">
                  <h2 id="bug-detail-title" class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {{ selectedBug.name }}
                  </h2>
                  <button
                    @click="copyTicketName"
                    class="flex-shrink-0 p-1.5 text-gray-500 hover:text-[#5bbcaa] hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copy ticket name"
                  >
                    <i class="fas fa-copy text-sm"></i>
                  </button>
                </div>
                <div id="bug-detail-header-info-row" class="flex items-center gap-4">
                  <div id="bug-detail-badges" class="flex items-center gap-2.5 flex-wrap">
                    <span 
                      v-if="selectedBug.priority"
                      id="bug-detail-priority-badge"
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                      :style="getPriorityStyle(selectedBug.priority, selectedBug.priorityColor)"
                    >
                      {{ selectedBug.priority }}
                    </span>
                    <span 
                      v-if="selectedBug.topic"
                      id="bug-detail-topic-badge"
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                      :style="getTopicStyle(selectedBug.topic, selectedBug.topicColor)"
                    >
                      {{ selectedBug.topic }}
                    </span>
                    <span 
                      v-if="selectedBug.version"
                      id="bug-detail-version-badge"
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    >
                      {{ selectedBug.version }}
                    </span>
                  </div>
                  
                  <div id="bug-detail-separator" class="w-px h-8 bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
                  
                  <div id="bug-detail-header-creator" class="flex-shrink-0">
                    <p id="bug-detail-created-date" class="text-sm text-gray-900 dark:text-gray-100">
                      <span id="bug-detail-created-label" class="text-gray-500 dark:text-gray-400">Reported by {{ getCreatorName(selectedBug.creatorId) }} on:</span> {{ selectedBug.createdDate || 'Unknown' }}
                    </p>
                  </div>
                  
                  <!-- Status Change Info (for Resolved, In Development, and Cancelled) -->
                  <template v-if="getCurrentStatusChangeInfo && selectedBug.statusBug !== 'Not Started'">
                    <div id="bug-detail-separator-2" class="w-px h-8 bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
                    
                    <div id="bug-detail-status-change" class="flex-shrink-0">
                      <p id="bug-detail-status-change-info" class="text-sm">
                        <span id="bug-detail-status-change-label" class="text-gray-500 dark:text-gray-400">
                          <template v-if="selectedBug.statusBug === 'Resolved'">Resolved</template>
                          <template v-else-if="selectedBug.statusBug === 'In Development'">In Development</template>
                          <template v-else-if="selectedBug.statusBug === 'Cancelled'">Cancelled</template>
                          by {{ getCurrentStatusChangeInfo.changedBy }} on:
                        </span> 
                        <span 
                          class="font-medium"
                          :class="{
                            'text-green-600 dark:text-green-400': selectedBug.statusBug === 'Resolved',
                            'text-orange-600 dark:text-orange-400': selectedBug.statusBug === 'In Development',
                            'text-red-600 dark:text-red-400': selectedBug.statusBug === 'Cancelled'
                          }"
                        >{{ getCurrentStatusChangeInfo.changedAt }}</span>
                      </p>
                    </div>
                  </template>
                </div>
              </div>
              
              <a 
                id="bug-detail-monday-link"
                :href="getMondayUrl(selectedBug.id, selectedBug.boardId)" 
                target="_blank"
                class="flex-shrink-0 px-4 py-2 text-sm font-medium text-[#5bbcaa] hover:text-[#4ca899] border border-[#5bbcaa] hover:bg-[#5bbcaa]/5 rounded-lg transition-colors bg-white dark:bg-gray-800"
              >
                <i id="bug-detail-monday-icon" class="fas fa-external-link-alt mr-2"></i>
                Open in Monday
              </a>
            </div>
          </div>

          <!-- Detail Body - Two Column Layout - Level 1 Background -->
          <div id="bug-detail-body" class="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
            <div id="bug-detail-content" class="grid grid-cols-2 gap-6">
              <!-- Left Column: Text Information -->
              <div id="bug-detail-left-column" class="space-y-6">
                <!-- Description - Level 3 -->
                <div id="bug-detail-description-container">
                  <label id="bug-detail-description-label" class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 block">Bug Description</label>
                  <div id="bug-detail-description-content" class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                    <p v-if="selectedBug.description" id="bug-detail-description-text" class="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{{ selectedBug.description }}</p>
                    <p v-else id="bug-detail-description-empty" class="text-base text-gray-500 dark:text-gray-400 italic">No description provided</p>
                  </div>
                </div>

                <!-- Reproduce Steps - Level 3 -->
                <div id="bug-detail-reproduce-container">
                  <label id="bug-detail-reproduce-label" class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 block">Steps to Reproduce</label>
                  <div id="bug-detail-reproduce-content" class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                    <p v-if="selectedBug.reproduceSteps" id="bug-detail-reproduce-text" class="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{{ selectedBug.reproduceSteps }}</p>
                    <p v-else id="bug-detail-reproduce-empty" class="text-base text-gray-500 dark:text-gray-400 italic">No reproduction steps provided</p>
                  </div>
                </div>

                <!-- Outcomes - Level 3 -->
                <div id="bug-detail-outcomes-container">
                  <label id="bug-detail-outcomes-label" class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 block">Expected vs Actual Outcomes</label>
                  <div id="bug-detail-outcomes-content" class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                    <p v-if="selectedBug.outcomes" id="bug-detail-outcomes-text" class="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{{ selectedBug.outcomes }}</p>
                    <p v-else id="bug-detail-outcomes-empty" class="text-base text-gray-500 dark:text-gray-400 italic">No outcomes information provided</p>
                  </div>
                </div>

              </div>

              <!-- Right Column: Media Carousel -->
              <div id="bug-detail-media-container">
                <label id="bug-detail-media-label" class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 block">Pictures / Videos</label>
                
                <div v-if="displayFiles.length > 0" id="bug-detail-media-content" class="space-y-4">
                  <!-- Media Carousel - Level 3 -->
                  <div id="bug-detail-media-carousel" class="relative bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden shadow-sm">
                    <!-- Current Media Display -->
                    <div id="bug-detail-media-display" class="relative aspect-video bg-black flex items-center justify-center cursor-pointer" @click="openMediaModal">
                      <!-- Video Player -->
                      <video 
                        v-if="isVideo(displayFiles[currentMediaIndex].name)"
                        id="bug-detail-media-video"
                        controls
                        class="w-full h-full object-contain"
                        :src="displayFiles[currentMediaIndex].public_url || displayFiles[currentMediaIndex].url"
                      >
                        Your browser does not support the video tag.
                      </video>
                      
                      <!-- Image Display -->
                      <img 
                        v-else-if="isImage(displayFiles[currentMediaIndex].name)"
                        id="bug-detail-media-image"
                        :src="displayFiles[currentMediaIndex].public_url || displayFiles[currentMediaIndex].url || displayFiles[currentMediaIndex].url_thumbnail"
                        :alt="displayFiles[currentMediaIndex].name"
                        class="w-full h-full object-contain"
                        @error="(e) => handleImageError(e, displayFiles[currentMediaIndex])"
                      />
                      
                      <!-- Expand Icon Overlay -->
                      <div id="bug-detail-media-expand" class="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-lg p-2 transition-colors">
                        <i id="bug-detail-media-expand-icon" class="fas fa-expand text-white text-sm"></i>
                      </div>
                    </div>
                    
                    <!-- Navigation Arrows -->
                    <button 
                      v-if="displayFiles.length > 1"
                      id="bug-detail-media-prev"
                      @click.stop="previousMedia"
                      class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <i id="bug-detail-media-prev-icon" class="fas fa-chevron-left"></i>
                    </button>
                    <button 
                      v-if="displayFiles.length > 1"
                      id="bug-detail-media-next"
                      @click.stop="nextMedia"
                      class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <i id="bug-detail-media-next-icon" class="fas fa-chevron-right"></i>
                    </button>
                    
                    <!-- Media Counter -->
                    <div id="bug-detail-media-counter" class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                      {{ currentMediaIndex + 1 }} / {{ displayFiles.length }}
                    </div>
                  </div>
                  
                  <!-- File Name - Level 4 (Darkest) -->
                  <div id="bug-detail-media-filename-container" class="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded">
                    <p id="bug-detail-media-filename" class="text-xs text-gray-900 dark:text-gray-100 truncate" :title="displayFiles[currentMediaIndex].name">
                      {{ displayFiles[currentMediaIndex].name }}
                    </p>
                  </div>
                  
                  <!-- Thumbnail Strip - Level 4 (Darkest) -->
                  <div v-if="displayFiles.length > 1" id="bug-detail-media-thumbnails" class="flex gap-2 overflow-x-auto pb-2 p-2 bg-gray-200 dark:bg-gray-600 rounded">
                    <button
                      v-for="(file, index) in displayFiles"
                      :key="index"
                      :id="`bug-detail-media-thumb-${index}`"
                      @click="currentMediaIndex = index"
                      class="flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-colors"
                      :class="[
                        currentMediaIndex === index
                          ? 'border-[#5bbcaa]'
                          : 'border-gray-400 dark:border-gray-500 hover:border-[#5bbcaa]/50'
                      ]"
                    >
                      <img 
                        v-if="isImage(file.name)"
                        :id="`bug-detail-media-thumb-img-${index}`"
                        :src="file.url_thumbnail || file.public_url || file.url"
                        :alt="file.name"
                        class="w-full h-full object-cover"
                      />
                      <div v-else-if="isVideo(file.name)" :id="`bug-detail-media-thumb-video-${index}`" class="w-full h-full bg-gray-800 flex items-center justify-center">
                        <i :id="`bug-detail-media-thumb-video-icon-${index}`" class="fas fa-play text-white text-lg"></i>
                      </div>
                    </button>
                  </div>
                </div>
                
                <p v-else id="bug-detail-media-empty" class="text-sm text-gray-500 dark:text-gray-400 italic p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                  No pictures or videos attached
                </p>
              </div>

              <!-- Comments / Updates - Level 3 -->
              <div id="bug-detail-updates-container" class="mt-6">
                <label id="bug-detail-updates-label" class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 block">
                  Comments / Updates
                  <span v-if="totalCommentsCount > 0" class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                    ({{ totalCommentsCount }})
                  </span>
                </label>

                <div v-if="selectedBug.updates.length > 0" id="bug-detail-updates-content" class="space-y-3">
                  <div
                    v-for="update in selectedBug.updates"
                    :key="update.id"
                    :id="`bug-detail-update-${update.id}`"
                    class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                  >
                    <!-- Update Header -->
                    <div :id="`bug-detail-update-header-${update.id}`" class="flex items-center justify-between mb-2">
                      <span :id="`bug-detail-update-author-${update.id}`" class="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {{ getCreatorName(update.creator_id) }}
                      </span>
                      <span :id="`bug-detail-update-date-${update.id}`" class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatUpdateTimestamp(update.created_at) }}
                      </span>
                    </div>
                    <!-- Update Body -->
                    <p :id="`bug-detail-update-text-${update.id}`" class="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                      {{ update.text_body }}
                    </p>

                    <!-- Replies -->
                    <div v-if="update.replies && update.replies.length > 0" class="mt-3 ml-4 space-y-2 border-l-2 border-gray-300 dark:border-gray-500 pl-4">
                      <div
                        v-for="reply in update.replies"
                        :key="reply.id"
                        :id="`bug-detail-reply-${reply.id}`"
                        class="p-3 bg-gray-200 dark:bg-gray-600 rounded-lg"
                      >
                        <div class="flex items-center justify-between mb-1">
                          <span class="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {{ getCreatorName(reply.creator_id) }}
                          </span>
                          <span class="text-xs text-gray-500 dark:text-gray-400">
                            {{ formatUpdateTimestamp(reply.created_at) }}
                          </span>
                        </div>
                        <p class="text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                          {{ reply.text_body }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else id="bug-detail-updates-empty" class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                  <p class="text-base text-gray-500 dark:text-gray-400 italic">No comments or updates</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State for Detail Panel -->
        <div v-else id="bug-detail-empty-state" class="h-full flex flex-col items-center justify-center p-8 text-center">
          <i id="bug-detail-empty-icon" class="fas fa-hand-pointer text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
          <h3 id="bug-detail-empty-title" class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select a bug to view details
          </h3>
          <p id="bug-detail-empty-text" class="text-sm text-gray-500 dark:text-gray-400">
            Click on a bug from the list to see its full information
          </p>
        </div>
      </div>
    </div>

    <!-- Media Modal -->
    <div 
      v-if="showMediaModal && displayFiles.length > 0"
      id="bug-detail-media-modal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="closeMediaModal"
    >
      <!-- Dark Overlay with visible border -->
      <div id="bug-detail-media-modal-overlay" class="absolute inset-0 bg-black/95 backdrop-blur-sm" @click="closeMediaModal"></div>
      
      <!-- Modal Content Container -->
      <div id="bug-detail-media-modal-container" class="relative max-w-7xl w-full h-full flex items-center justify-center z-10" @click.self="closeMediaModal">
        <!-- Media Display with visible container -->
        <div id="bug-detail-media-modal-content" class="relative max-w-full max-h-[90vh] w-full flex items-center justify-center bg-gray-900/50 rounded-lg border-2 border-white/20 shadow-2xl p-4" @click.stop>
          <!-- Close Button (outside modal border, perfectly round) -->
          <button 
            id="bug-detail-media-modal-close"
            @click="closeMediaModal"
            class="absolute -top-14 -right-14 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors z-30 shadow-lg"
          >
            <i id="bug-detail-media-modal-close-icon" class="fas fa-times text-xl"></i>
          </button>
          <!-- Video Player -->
          <video 
            v-if="isVideo(displayFiles[currentMediaIndex].name)"
            id="bug-detail-media-modal-video"
            controls
            class="max-w-full max-h-[85vh] w-auto h-auto rounded"
            :src="displayFiles[currentMediaIndex].public_url || displayFiles[currentMediaIndex].url"
            autoplay
          >
            Your browser does not support the video tag.
          </video>
          
          <!-- Image Display -->
          <img 
            v-else-if="isImage(displayFiles[currentMediaIndex].name)"
            id="bug-detail-media-modal-image"
            :src="displayFiles[currentMediaIndex].public_url || displayFiles[currentMediaIndex].url"
            :alt="displayFiles[currentMediaIndex].name"
            class="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded"
          />
          
          <!-- Navigation Arrows (outside modal border, perfectly round) -->
          <button 
            v-if="displayFiles.length > 1"
            id="bug-detail-media-modal-prev"
            @click.stop="previousMedia"
            class="absolute -left-16 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-14 h-14 flex items-center justify-center transition-colors z-30 shadow-lg"
          >
            <i id="bug-detail-media-modal-prev-icon" class="fas fa-chevron-left text-3xl"></i>
          </button>
          <button 
            v-if="displayFiles.length > 1"
            id="bug-detail-media-modal-next"
            @click.stop="nextMedia"
            class="absolute -right-16 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-14 h-14 flex items-center justify-center transition-colors z-30 shadow-lg"
          >
            <i id="bug-detail-media-modal-next-icon" class="fas fa-chevron-right text-3xl"></i>
          </button>
        </div>
        
        <!-- Media Info -->
        <div id="bug-detail-media-modal-info" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg max-w-2xl">
          <p id="bug-detail-media-modal-filename" class="text-sm text-center truncate">{{ displayFiles[currentMediaIndex].name }}</p>
          <p id="bug-detail-media-modal-counter" class="text-xs text-center text-gray-300 mt-1">{{ currentMediaIndex + 1 }} / {{ displayFiles.length }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useUserStore } from '~/stores/userStore'

interface Props {
  items: any[]
}

const props = defineProps<Props>()
const userStore = useUserStore()

const searchQuery = ref('')
const selectedBug = ref<Bug | null>(null)
const activeStatus = ref<'notStarted' | 'inDevelopment' | 'resolved' | 'cancelled'>('notStarted')
const currentMediaIndex = ref(0)
const showMediaModal = ref(false)
const showFilters = ref(false)
const priorityFilter = ref('all')
const sortOption = ref<'priority-high' | 'priority-low' | 'date-latest' | 'date-earliest'>('priority-high')

interface Asset {
  id: string
  name: string
  url: string
  public_url: string
  url_thumbnail?: string
  file_extension: string
  file_size: number
}

interface StatusChangeHistory {
  from_status: string
  to_status: string
  changed_by_user_id: string
  changed_at: string
}

interface Reply {
  id: string
  text_body: string
  body: string
  creator_id: string
  created_at: string
  updated_at: string
}

interface Update {
  id: string
  text_body: string
  body: string
  creator_id: string
  created_at: string
  updated_at: string
  replies?: Reply[]
}

interface Bug {
  id: string
  name: string
  boardId: string
  statusBug: string
  statusBugColor: string
  priority: string
  priorityColor: string
  topic: string
  topicColor: string
  version: string
  dev: string
  statusTicket: string
  description: string
  reproduceSteps: string
  outcomes: string
  creationLog: string
  creatorId: string
  createdDate: string
  files: any[]
  assets: Asset[]
  statusChangeHistory?: StatusChangeHistory[]
  updates: Update[]
}

const filteredBugs = computed<Bug[]>(() => {
  const query = searchQuery.value.toLowerCase()
  
  return props.items
    .filter(item => {
      if (!query) return true
      return item.name.toLowerCase().includes(query)
    })
    .map(item => {
      // Find the relevant columns based on the API response structure
      const statusBugColumn = item.columnValues.find((cv: any) => cv.id === 'color_mkvxkwcm')
      const priorityColumn = item.columnValues.find((cv: any) => cv.id === 'priority_1')
      const topicColumn = item.columnValues.find((cv: any) => cv.id === 'single_select7ybqjpr')
      const versionColumn = item.columnValues.find((cv: any) => cv.id === 'dropdown_mkxp5yr0')
      const devColumn = item.columnValues.find((cv: any) => cv.id === 'lookup_mkx6ryjh')
      const statusTicketColumn = item.columnValues.find((cv: any) => cv.id === 'lookup_mkx66kex')
      const descriptionColumn = item.columnValues.find((cv: any) => cv.id === 'long_text')
      const reproduceColumn = item.columnValues.find((cv: any) => cv.id === 'long_text8k4x1n6g')
      const outcomesColumn = item.columnValues.find((cv: any) => cv.id === 'long_textdfmxxlyc')
      const creationLogColumn = item.columnValues.find((cv: any) => cv.id === 'pulse_log')
      const filesColumn = item.columnValues.find((cv: any) => cv.id === 'files')
      
      // Parse creation log to get creator ID
      let creatorId = ''
      let createdDate = ''
      if (creationLogColumn?.value) {
        try {
          const logData = JSON.parse(creationLogColumn.value)
          if (logData.created_at) {
            createdDate = new Date(logData.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }
          if (logData.creator_id) {
            creatorId = logData.creator_id
          }
        } catch (e) {
          createdDate = creationLogColumn.text || ''
        }
      }
      
      // Get files directly from GraphQL response (not from value JSON)
      let files: any[] = []
      if (filesColumn && Array.isArray(filesColumn.files)) {
        files = filesColumn.files
      } else if (filesColumn?.value) {
        // Fallback to parsing value if files array not available
        try {
          const filesData = JSON.parse(filesColumn.value)
          if (filesData.files && Array.isArray(filesData.files)) {
            files = filesData.files
          }
        } catch (e) {
          console.error('Error parsing files:', e)
        }
      }

      // Get assets from the item (this contains the actual URLs)
      const assets: Asset[] = item.assets || []

      return {
        id: item.id,
        name: item.name,
        boardId: item.boardId,
        statusBug: statusBugColumn?.text || 'No Status',
        statusBugColor: statusBugColumn?.label_style?.color || '#cbd5e1',
        priority: priorityColumn?.text || 'No Priority',
        priorityColor: priorityColumn?.label_style?.color || '#cbd5e1',
        topic: topicColumn?.text || '',
        topicColor: topicColumn?.label_style?.color || '#cbd5e1',
        version: versionColumn?.text || '',
        dev: devColumn?.text || '',
        statusTicket: statusTicketColumn?.text || '',
        description: descriptionColumn?.text || '',
        reproduceSteps: reproduceColumn?.text || '',
        outcomes: outcomesColumn?.text || '',
        creationLog: creationLogColumn?.text || '',
        creatorId,
        createdDate,
        files,
        assets,
        statusChangeHistory: item.statusChangeHistory || [],
        updates: item.updates || []
      }
    })
})

const bugsByStatus = computed(() => {
  return {
    notStarted: filteredBugs.value.filter(bug => bug.statusBug === 'Not Started'),
    inDevelopment: filteredBugs.value.filter(bug => bug.statusBug === 'In Development'),
    resolved: filteredBugs.value.filter(bug => bug.statusBug === 'Resolved'),
    cancelled: filteredBugs.value.filter(bug => bug.statusBug === 'Cancelled')
  }
})

const currentStatusBugs = computed(() => {
  let bugs = bugsByStatus.value[activeStatus.value]
  
  // Apply priority filter
  if (priorityFilter.value !== 'all') {
    bugs = bugs.filter(bug => bug.priority === priorityFilter.value)
  }
  
  // Define priority order
  const priorityOrder: { [key: string]: number } = {
    'Critical': 1,
    'High': 2,
    'Medium': 3,
    'Low': 4,
    'No Priority': 5
  }
  
  // Apply sorting
  const sortedBugs = [...bugs].sort((a, b) => {
    switch (sortOption.value) {
      case 'priority-high':
        // High to Low (Critical first)
        return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999)
      
      case 'priority-low':
        // Low to High (Low first)
        return (priorityOrder[b.priority] || 999) - (priorityOrder[a.priority] || 999)
      
      case 'date-latest':
        // Latest first (newest dates first)
        if (!a.createdDate && !b.createdDate) return 0
        if (!a.createdDate) return 1
        if (!b.createdDate) return -1
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      
      case 'date-earliest':
        // Earliest first (oldest dates first)
        if (!a.createdDate && !b.createdDate) return 0
        if (!a.createdDate) return 1
        if (!b.createdDate) return -1
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
      
      default:
        return 0
    }
  })
  
  return sortedBugs
})

const totalCommentsCount = computed(() => {
  if (!selectedBug.value) return 0
  const updates = selectedBug.value.updates
  const repliesCount = updates.reduce((sum, u) => sum + (u.replies?.length || 0), 0)
  return updates.length + repliesCount
})

const displayFiles = computed(() => {
  if (!selectedBug.value) return []
  
  // Prefer assets as they have proper URLs (public_url, url, url_thumbnail)
  if (selectedBug.value.assets && selectedBug.value.assets.length > 0) {
    return selectedBug.value.assets
  }
  
  // Fallback to files column data if no assets
  if (selectedBug.value.files && selectedBug.value.files.length > 0) {
    return selectedBug.value.files
  }
  
  return []
})

const getStatusStyle = (status: string, color: string) => {
  return {
    backgroundColor: `${color}20`,
    color: color,
    borderWidth: '1px',
    borderColor: color
  }
}

const getPriorityStyle = (priority: string, color: string) => {
  return {
    backgroundColor: `${color}20`,
    color: color,
    borderWidth: '1px',
    borderColor: color
  }
}

const getTopicStyle = (topic: string, color: string) => {
  return {
    backgroundColor: `${color}20`,
    color: color,
    borderWidth: '1px',
    borderColor: color
  }
}

const getMondayUrl = (itemId: string, boardId: string): string => {
  return `https://woojin-world.monday.com/boards/${boardId}/pulses/${itemId}`
}

const selectBug = (bug: Bug) => {
  selectedBug.value = bug
  currentMediaIndex.value = 0 // Reset to first media when selecting a new bug
  scrollToSelectedBug(bug.id)
}

const getCreatorName = (creatorId: string): string => {
  if (!creatorId) return 'Unknown'
  
  // Find the user by ID
  const user = userStore.users.find(u => u.id === creatorId)
  return user?.name || 'Unknown User'
}

const formatActivityTimestamp = (timestamp: string): string => {
  if (!timestamp) return 'Unknown'
  
  try {
    // Monday.com activity logs use 17-digit Unix time (nanoseconds precision)
    // Convert to milliseconds by dividing by 10,000 and rounding
    const milliseconds = Math.round(parseInt(timestamp) / 10000)
    const date = new Date(milliseconds)
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return 'Unknown'
  }
}

const formatUpdateTimestamp = (isoDate: string): string => {
  if (!isoDate) return 'Unknown'

  try {
    const date = new Date(isoDate)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return 'Unknown'
  }
}

const getCurrentStatusChangeInfo = computed(() => {
  if (!selectedBug.value || !selectedBug.value.statusChangeHistory || selectedBug.value.statusChangeHistory.length === 0) {
    return null
  }
  
  const currentStatus = selectedBug.value.statusBug
  const history = selectedBug.value.statusChangeHistory
  
  // Find the most recent change TO the current status (case-insensitive match)
  // Iterate backwards through history (newest first)
  for (let i = history.length - 1; i >= 0; i--) {
    const change = history[i]
    if (change && change.to_status) {
      // Handle both string and object formats for to_status
      const toStatusText = typeof change.to_status === 'string' 
        ? change.to_status 
        : change.to_status.text || ''
      
      if (toStatusText && toStatusText.toLowerCase() === currentStatus.toLowerCase()) {
        return {
          changedBy: getCreatorName(change.changed_by_user_id),
          changedAt: formatActivityTimestamp(change.changed_at),
          status: currentStatus
        }
      }
    }
  }
  
  return null
})

const isVideo = (filename: string): boolean => {
  if (!filename) return false
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.m4v']
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

const isImage = (filename: string): boolean => {
  if (!filename) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

const handleImageError = (event: Event, file: any) => {
  console.error('Failed to load image:', event)
  console.error('File data:', file)
  console.error('Available properties:', Object.keys(file))
  console.error('Tried URLs:', {
    url: file.url,
    public_url: file.public_url,
    url_thumbnail: file.url_thumbnail
  })
}

const hasAttachments = (bug: Bug): boolean => {
  return (bug.assets && bug.assets.length > 0) || (bug.files && bug.files.length > 0)
}

const hasImages = (bug: Bug): boolean => {
  const allFiles = bug.assets || bug.files || []
  return allFiles.some((file: any) => isImage(file.name))
}

const hasVideos = (bug: Bug): boolean => {
  const allFiles = bug.assets || bug.files || []
  return allFiles.some((file: any) => isVideo(file.name))
}

const previousMedia = () => {
  if (currentMediaIndex.value > 0) {
    currentMediaIndex.value--
  } else {
    currentMediaIndex.value = displayFiles.value.length - 1
  }
}

const nextMedia = () => {
  if (currentMediaIndex.value < displayFiles.value.length - 1) {
    currentMediaIndex.value++
  } else {
    currentMediaIndex.value = 0
  }
}

const openMediaModal = () => {
  showMediaModal.value = true
}

const closeMediaModal = () => {
  showMediaModal.value = false
}

const copyTicketName = async () => {
  if (!selectedBug.value) return
  
  try {
    await navigator.clipboard.writeText(selectedBug.value.name)
    // Optional: You could add a toast notification here to confirm the copy
    console.log('Ticket name copied to clipboard:', selectedBug.value.name)
  } catch (err) {
    console.error('Failed to copy ticket name:', err)
  }
}

const scrollToSelectedBug = (bugId: string) => {
  nextTick(() => {
    const bugElement = document.getElementById(`bug-item-${bugId}`)
    if (bugElement) {
      bugElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
  })
}

const handleKeydown = (event: KeyboardEvent) => {
  // Handle media modal navigation
  if (showMediaModal.value) {
    switch (event.key) {
      case 'Escape':
        closeMediaModal()
        break
      case 'ArrowLeft':
        previousMedia()
        break
      case 'ArrowRight':
        nextMedia()
        break
    }
    return
  }
  
  // Handle bug list navigation
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault() // Prevent page scroll
    
    const currentBugs = currentStatusBugs.value
    if (currentBugs.length === 0) return
    
    if (!selectedBug.value) {
      // No bug selected, select the first one
      selectedBug.value = currentBugs[0]
      currentMediaIndex.value = 0
      scrollToSelectedBug(currentBugs[0].id)
      return
    }
    
    const currentIndex = currentBugs.findIndex(bug => bug.id === selectedBug.value?.id)
    if (currentIndex === -1) {
      // Current bug not in list, select first
      selectedBug.value = currentBugs[0]
      currentMediaIndex.value = 0
      scrollToSelectedBug(currentBugs[0].id)
      return
    }
    
    if (event.key === 'ArrowUp' && currentIndex > 0) {
      // Navigate to previous bug
      selectedBug.value = currentBugs[currentIndex - 1]
      currentMediaIndex.value = 0
      scrollToSelectedBug(currentBugs[currentIndex - 1].id)
    } else if (event.key === 'ArrowDown' && currentIndex < currentBugs.length - 1) {
      // Navigate to next bug
      selectedBug.value = currentBugs[currentIndex + 1]
      currentMediaIndex.value = 0
      scrollToSelectedBug(currentBugs[currentIndex + 1].id)
    }
  }
}

// Watch for activeStatus, priorityFilter, or sortOption changes and auto-select first bug
watch([activeStatus, priorityFilter, sortOption], () => {
  if (currentStatusBugs.value.length > 0) {
    selectedBug.value = currentStatusBugs.value[0]
    currentMediaIndex.value = 0
  } else {
    selectedBug.value = null
  }
})

// Add keyboard event listener
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // Auto-select first bug on mount
  if (currentStatusBugs.value.length > 0) {
    selectedBug.value = currentStatusBugs.value[0]
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
</style>

