import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pocName = process.argv[2];
const type = process.argv[3] || 'basic'; // 'basic', 'webgl', 'websocket', 'webrtc', 'api', 'todo'
const withBackend = process.argv.includes('--backend') || process.argv.includes('-b');

if (!pocName) {
  console.error('\n❌ Error: Please provide a POC name (e.g., "WebGPU")');
  console.log('\nUsage:');
  console.log('  npm run create-poc <name> [type] [--backend]');
  console.log('\nAvailable Types:');
  console.log('  basic      - Simple UI card (default)');
  console.log('  webgl      - Three.js 3D scene');
  console.log('  websocket  - Real-time messaging');
  console.log('  webrtc     - Peer-to-peer communication');
  console.log('  api        - REST data fetching');
  console.log('  todo       - State management');
  console.log('\nOptions:');
  console.log('  --backend, -b  - Generate a corresponding Hono backend module');
  process.exit(1);
}

const id = pocName.toLowerCase().replace(/\s+/g, '-');
// camelCase form of the id — a valid JS identifier, safe for multi-word names
// (e.g. "my-poc" -> "myPoc"). Used for the backend import binding and the
// Hono instance variable in generated server modules.
const camelId = id.replace(/-([a-z])/g, g => g[1].toUpperCase());
const componentName = pocName.replace(/(^\w|\s\w)/g, m => m.trim().toUpperCase()).replace(/\s+/g, '');
const fileName = `${componentName}.tsx`;
const rootDir = path.join(__dirname, '..');
const templateDir = path.join(rootDir, 'scripts/templates'); // Local project scripts/templates

const filePath = path.join(rootDir, 'src/pages/pocs', fileName);
const configPath = path.join(rootDir, 'src/config/pocs.ts');
const serverPocPath = path.join(rootDir, 'server/pocs', `${id}.ts`);
const serverRoutesPath = path.join(rootDir, 'server/routes.ts');

console.log(`\n🧪 Scaffolding POC: "${pocName}" (${type})`);

// --- 1. Create the Frontend Component ---

const frontendTemplates = fs.readdirSync(path.join(templateDir, 'frontend'))
  .filter(f => f.endsWith('.tsx'))
  .map(f => f.replace('.tsx', ''));

let templatePath = path.join(templateDir, 'frontend', `${type}.tsx`);
if (!fs.existsSync(templatePath)) {
  console.warn(`  ⚠️  Template "${type}" not found.`);
  console.log(`     Available templates: ${frontendTemplates.join(', ')}`);
  console.log('     Falling back to basic.');
  templatePath = path.join(templateDir, 'frontend', 'basic.tsx');
}

let frontendTemplate = fs.readFileSync(templatePath, 'utf8');

// Replacements
frontendTemplate = frontendTemplate
  .replace(/__NAME__/g, pocName)
  .replace(/__COMPONENT_NAME__/g, componentName)
  .replace(/__ID__/g, id)
  .replace(/__FILE_NAME__/g, fileName);

// Handle legacy-style replacements for copied files
if (type === 'webgl') {
  frontendTemplate = frontendTemplate
    .replace('export default function WebGLTemplate()', `export default function ${componentName}POC()`)
    .replace('title="WebGL Template"', `title="${pocName}"`)
    .replace('subtitle="Robust Three.js setup with lighting, controls, and safe disposal."', `subtitle="Research experiment into ${pocName} using Three.js."`)
    .replace('pocId="webgl-template"', `pocId="${id}"`)
    .replace(/WebGLTemplate\.tsx/g, fileName);
} else if (['websocket', 'api', 'todo', 'webrtc'].includes(type)) {
  frontendTemplate = frontendTemplate
    .replace(new RegExp(`export default function ${type.charAt(0).toUpperCase() + type.slice(1)}POC\\(\\)`, 'g'), `export default function ${componentName}POC()`)
    .replace(new RegExp(`pocId="${type}"`, 'g'), `pocId="${id}"`)
    .replace(new RegExp(`title=".*"`, 'i'), `title="${pocName}"`);
}

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, frontendTemplate);
  console.log(`  ✅ Frontend: ${fileName}`);
} else {
  console.warn(`  ⚠️  Frontend component already exists.`);
}

// --- 2. Update Frontend Config (src/config/pocs.ts) ---

let configContent = fs.readFileSync(configPath, 'utf8');

if (!configContent.includes(`${componentName}POC`)) {
  // Add lazy import
  const importMatch = configContent.match(/const .* = React\.lazy.*/g);
  const lastImport = importMatch[importMatch.length - 1];
  const newImport = `const ${componentName}POC = React.lazy(() => import('../pages/pocs/${componentName}'))`;
  configContent = configContent.replace(lastImport, `${lastImport}\n${newImport}`);

  // Add to POC_CONFIG
const categoryMap = {
    webgl: 'Graphics',
    websocket: 'Network',
    webrtc: 'Network',
    api: 'Network',
    todo: 'State',
    basic: 'General'
  };

  const category = categoryMap[type] || 'General';
  
  const configEntry = `  {
    id: '${id}',
    name: '${pocName}',
    path: '/pocs/${id}',
    component: ${componentName}POC,
    badge: 'POC',
    badgeType: 'POC',
    category: '${category}',
    description: 'Research experiment into ${pocName}.'
  },`;
  
  configContent = configContent.replace('export const POC_CONFIG: POCMetadata[] = [', `export const POC_CONFIG: POCMetadata[] = [\n${configEntry}`);
  
  fs.writeFileSync(configPath, configContent);
  console.log(`  ✅ Config:   Updated src/config/pocs.ts`);
}

// --- 3. Create Backend Module (Optional) ---

if (withBackend || type === 'todo' || type === 'api' || type === 'websocket') {
  let serverTemplatePath = path.join(templateDir, 'backend', `${type === 'todo' ? 'todo' : 'basic'}.ts`);
  if (!fs.existsSync(serverTemplatePath)) {
    serverTemplatePath = path.join(templateDir, 'backend', 'basic.ts');
  }

  let serverTemplate = fs.readFileSync(serverTemplatePath, 'utf8');
  serverTemplate = serverTemplate
    .replace(/__NAME__/g, pocName)
    .replace(/__BINDING__/g, camelId)
    .replace(/__ID__/g, id);

  if (!fs.existsSync(serverPocPath)) {
    fs.writeFileSync(serverPocPath, serverTemplate);
    console.log(`  ✅ Backend:  server/pocs/${id}.ts`);
  }

  // --- 4. Update Backend Routes (server/routes.ts) ---

  let routesContent = fs.readFileSync(serverRoutesPath, 'utf8');

  if (!routesContent.includes(`./pocs/${id}`)) {
    // Add import
    const importMatch = routesContent.match(/import .* from '\.\/pocs\/.*'/g);
    const lastImport = importMatch ? importMatch[importMatch.length - 1] : "import hello from './pocs/hello'";
    const newImport = `import ${camelId} from './pocs/${id}'`;
    routesContent = routesContent.replace(lastImport, `${lastImport}\n${newImport}`);

    // Add route
    const routeMatch = routesContent.match(/api\.route\('.*', .*\)/g);
    const lastRoute = routeMatch ? routeMatch[routeMatch.length - 1] : "api.route('/pocs/hello', hello)";
    const newRoute = `api.route('/pocs/${id}', ${camelId})`;
    routesContent = routesContent.replace(lastRoute, `${lastRoute}\n${newRoute}`);

    fs.writeFileSync(serverRoutesPath, routesContent);
    console.log(`  ✅ Routes:   Updated server/routes.ts`);
  }
}

console.log(`\n🚀 POC "${pocName}" is ready!`);
console.log(`   🔗 Web: http://localhost:5173/pocs/${id}`);
if (withBackend || ['todo', 'api', 'websocket'].includes(type)) {
  console.log(`   🔗 API: http://localhost:3001/api/pocs/${id}`);
}
console.log('');
