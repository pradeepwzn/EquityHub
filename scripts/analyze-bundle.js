#!/usr/bin/env node

/**
 * Bundle Analysis Script for Startup Value Simulator
 * 
 * This script analyzes the Next.js bundle to identify:
 * - Largest dependencies
 * - Unused code
 * - Bundle splitting opportunities
 * - Performance bottlenecks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Configuration
const config = {
  maxBundleSize: 500 * 1024, // 500KB
  maxChunkSize: 200 * 1024,  // 200KB
  criticalDependencies: [
    'react',
    'react-dom',
    'next',
    'antd',
    '@ant-design/plots'
  ],
  analyzeThreshold: 100 * 1024 // 100KB
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bold');
  log('='.repeat(60), 'cyan');
}

function logSection(title) {
  log(`\n${title}:`, 'yellow');
  log('-'.repeat(title.length + 1), 'yellow');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundleStats() {
  logHeader('Bundle Analysis Report');
  
  try {
    // Check if .next directory exists
    const nextDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(nextDir)) {
      logError('Build directory not found. Run "npm run build" first.');
      return;
    }

    // Analyze bundle stats
    const statsFile = path.join(nextDir, 'analyze', 'client.html');
    if (fs.existsSync(statsFile)) {
      logSuccess('Bundle analyzer report found');
      logInfo(`Open ${statsFile} in your browser for detailed analysis`);
    } else {
      logWarning('Bundle analyzer report not found');
      logInfo('Run "ANALYZE=true npm run build" to generate detailed analysis');
    }

    // Analyze chunk sizes
    analyzeChunkSizes(nextDir);
    
    // Analyze dependencies
    analyzeDependencies();
    
    // Performance recommendations
    generateRecommendations();
    
  } catch (error) {
    logError(`Analysis failed: ${error.message}`);
  }
}

function analyzeChunkSizes(nextDir) {
  logSection('Chunk Size Analysis');
  
  try {
    const staticDir = path.join(nextDir, 'static', 'chunks');
    if (fs.existsSync(staticDir)) {
      const chunks = fs.readdirSync(staticDir);
      let totalSize = 0;
      const chunkSizes = [];
      
      chunks.forEach(chunk => {
        if (chunk.endsWith('.js')) {
          const chunkPath = path.join(staticDir, chunk);
          const stats = fs.statSync(chunkPath);
          const size = stats.size;
          totalSize += size;
          
          chunkSizes.push({
            name: chunk,
            size: size,
            path: chunkPath
          });
        }
      });
      
      // Sort by size (largest first)
      chunkSizes.sort((a, b) => b.size - a.size);
      
      logInfo(`Total bundle size: ${formatBytes(totalSize)}`);
      logInfo(`Number of chunks: ${chunkSizes.length}`);
      
      // Show largest chunks
      logInfo('\nLargest chunks:');
      chunkSizes.slice(0, 5).forEach((chunk, index) => {
        const status = chunk.size > config.maxChunkSize ? '⚠️' : '✅';
        log(`${status} ${chunk.name}: ${formatBytes(chunk.size)}`);
      });
      
      // Check for oversized chunks
      const oversizedChunks = chunkSizes.filter(chunk => chunk.size > config.maxChunkSize);
      if (oversizedChunks.length > 0) {
        logWarning(`${oversizedChunks.length} chunks exceed ${formatBytes(config.maxChunkSize)} limit`);
      }
      
      // Check total bundle size
      if (totalSize > config.maxBundleSize) {
        logError(`Total bundle size ${formatBytes(totalSize)} exceeds ${formatBytes(config.maxBundleSize)} limit`);
      } else {
        logSuccess(`Bundle size is within limits`);
      }
    }
  } catch (error) {
    logError(`Failed to analyze chunk sizes: ${error.message}`);
  }
}

function analyzeDependencies() {
  logSection('Dependency Analysis');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    logInfo('Critical dependencies:');
    config.criticalDependencies.forEach(dep => {
      if (dependencies[dep]) {
        log(`  ${dep}: ${dependencies[dep]}`);
      }
    });
    
    // Check for large dependencies
    const largeDeps = [
      'antd',
      '@ant-design/plots',
      '@ant-design/icons',
      'lodash-es'
    ];
    
    logInfo('\nLarge dependencies to monitor:');
    largeDeps.forEach(dep => {
      if (dependencies[dep]) {
        log(`  ${dep}: ${dependencies[dep]}`);
      }
    });
    
    // Check for duplicate dependencies
    const duplicateCheck = execSync('npm ls --depth=0', { encoding: 'utf8' });
    const duplicates = duplicateCheck.match(/UNMET PEER DEPENDENCY|npm ERR/g);
    if (duplicates) {
      logWarning('Potential dependency conflicts detected');
      logInfo('Run "npm ls" to see detailed dependency tree');
    }
    
  } catch (error) {
    logError(`Failed to analyze dependencies: ${error.message}`);
  }
}

function generateRecommendations() {
  logSection('Performance Recommendations');
  
  const recommendations = [
    {
      category: 'Bundle Optimization',
      items: [
        'Use dynamic imports for route-based code splitting',
        'Implement tree shaking for unused exports',
        'Consider using Next.js bundle analyzer',
        'Optimize images with next/image component'
      ]
    },
    {
      category: 'Memory Management',
      items: [
        'Use React.memo for expensive components',
        'Implement virtual scrolling for large lists',
        'Lazy load non-critical components',
        'Use Web Workers for heavy calculations'
      ]
    },
    {
      category: 'Caching Strategy',
      items: [
        'Implement service worker caching',
        'Use React Query for API caching',
        'Cache expensive calculations with useMemo',
        'Implement progressive loading'
      ]
    },
    {
      category: 'Monitoring',
      items: [
        'Set up performance budgets',
        'Monitor Core Web Vitals',
        'Track bundle size over time',
        'Use Lighthouse for performance audits'
      ]
    }
  ];
  
  recommendations.forEach(rec => {
    log(`\n${rec.category}:`, 'magenta');
    rec.items.forEach(item => {
      log(`  • ${item}`);
    });
  });
}

function runBundleAnalysis() {
  logHeader('Startup Value Simulator - Bundle Analysis');
  
  try {
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      logError('Please run this script from the project root directory');
      process.exit(1);
    }
    
    // Run the analysis
    analyzeBundleStats();
    
    logHeader('Analysis Complete');
    logInfo('For detailed analysis, run: ANALYZE=true npm run build');
    logInfo('Then open .next/analyze/client.html in your browser');
    
  } catch (error) {
    logError(`Analysis failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the analysis if this script is executed directly
if (require.main === module) {
  runBundleAnalysis();
}

module.exports = {
  analyzeBundleStats,
  analyzeChunkSizes,
  analyzeDependencies,
  generateRecommendations
};





