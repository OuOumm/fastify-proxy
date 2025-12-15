import autocannon from 'autocannon';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 启动代理服务器
const server = spawn('node', [path.join(__dirname, 'app.js')]);

// 等待服务器启动
setTimeout(() => {
  console.log('开始性能测试...');
  
  // 测试静态规则
  const staticTest = autocannon({
    url: 'http://localhost:23000/gh/OuOumm/omo@master/data/Blog/9.2.1/assets/.gitignore',
    connections: 100,
    duration: 10,
    title: '静态规则测试'
  });
  
  autocannon.track(staticTest, { renderProgressBar: true });
  
  staticTest.on('done', (result) => {
    console.log('\n静态规则测试结果:');
    console.log(`请求数: ${result.requests.total}`);
    console.log(`平均延迟: ${result.latency.average}ms`);
    console.log(`吞吐量: ${result.throughput.average} req/s`);
    
    // 测试动态规则
    const dynamicTest = autocannon({
      url: 'http://localhost:23000/proxy/https://gcore.jsdelivr.net/gh/OuOumm/omo@master/data/Blog/9.2.1/assets/.gitignore',
      connections: 100,
      duration: 10,
      title: '动态规则测试'
    });
    
    autocannon.track(dynamicTest, { renderProgressBar: true });
    
    dynamicTest.on('done', (result) => {
      console.log('\n动态规则测试结果:');
      console.log(`请求数: ${result.requests.total}`);
      console.log(`平均延迟: ${result.latency.average}ms`);
      console.log(`吞吐量: ${result.throughput.average} req/s`);
      
      // 关闭服务器
      server.kill();
    });
  });
  
}, 2000);

// 捕获服务器输出
server.stdout.on('data', (data) => {
  // console.log(`[服务器] ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
  console.error(`[服务器错误] ${data.toString().trim()}`);
});

server.on('close', (code) => {
  console.log(`\n服务器已关闭，退出码: ${code}`);
});
