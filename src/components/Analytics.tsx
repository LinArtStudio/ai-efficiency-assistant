import Script from 'next/script'

export default function Analytics() {
  return (
    <>
      {/* 百度统计 - 需要替换为实际的统计ID */}
      <Script
        id="baidu-analytics"
        dangerouslySetInnerHTML={{
          __html: `
            var _hmt = _hmt || [];
            (function() {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?YOUR_TRACKING_ID";
              var s = document.getElementsByTagName("script")[0]; 
              s.parentNode.insertBefore(hm, s);
            })();
          `,
        }}
      />
    </>
  )
}
