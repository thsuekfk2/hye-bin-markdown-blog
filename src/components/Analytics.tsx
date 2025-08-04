import Script from "next/script";

export const Analytics = () => {
  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      ></Script>
      <meta
        name="google-site-verification"
        content="iMPrP8ilvDDTleMZfYPnzYEFk9HmhiVInzKLOId0smg"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
        }}
      />
    </>
  );
};
