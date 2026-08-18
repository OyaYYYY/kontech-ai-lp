/**
 * カネモトAI講習会LP：白地と建設ブルー、背景に淡く流れる波線、自然にトリミングした社長写真を基調に、AIを現場の仕事へ落とし込むLP。
 */
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BadgeCheck,
  BookOpenCheck,
  Calculator,
  Camera,
  CalendarClock,
  Check,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  Menu,
  MessageCircle,
  ShieldCheck,
  X,
} from "lucide-react";

// 差し替え箇所：正式URLの受領後、この2行だけを更新する。
const OFFICIAL_LINE_URL = "https://line.me/ti/p/@kanemotoai";

function trackCtaClick(event: "line_register_click" | "inquiry_click" | "inquiry_form_submit", placement: string) {
  const analytics = (window as Window & {
    umami?: { track?: (eventName: string, data?: Record<string, string>) => void };
  }).umami;
  analytics?.track?.(event, { placement });
}

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`brand-mark ${inverse ? "brand-mark--inverse" : ""}`} aria-hidden="true">
      <img src="/assets/kanemoto-logo-tagline.svg" alt="" />
    </span>
  );
}

const WAVE_SVG_PATH = "/assets/fv-wave.svg";
const WAVE_SVG_WIDTH = 1440;
const WAVE_SVG_HEIGHT = 730;
const WAVE_BREAKPOINT = 834;
const WAVE_OFFSET_X_SMALL = -35;
const WAVE_SAMPLES = 200;

type WaveLine = { points: { x: number; y: number }[]; opacity: number };

/**
 * カネモト本体サイトのFVと同じ波線。fv-wave.svg の各パスを等間隔でサンプリングし、
 * y に sin(x * 0.01 + t + i * 0.3) * 3 を足して流す（three.js版と同じ計算）。
 */
function WaveField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let lines: WaveLine[] = [];
    let width = 0;
    let height = 0;
    let time = 0;
    let frame = 0;
    let disposed = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      if (!lines.length || !width || !height) return;

      const compact = window.innerWidth <= WAVE_BREAKPOINT;
      const scale = width / WAVE_SVG_WIDTH;
      const zoom = compact ? 1 / 0.55 : 1;
      const centerX = compact ? WAVE_OFFSET_X_SMALL : 0;

      context.lineWidth = 1;

      lines.forEach((line, index) => {
        context.beginPath();
        context.strokeStyle = `rgba(255,255,255,${line.opacity})`;

        line.points.forEach((point, pointIndex) => {
          const waved = point.y + Math.sin(point.x * 0.01 + time + index * 0.3) * 3;
          const unitX = point.x * scale - width / 2;
          const unitY = scale * (WAVE_SVG_HEIGHT / 2 - waved);
          const screenX = width / 2 + (unitX - centerX) * zoom;
          const screenY = height / 2 - unitY * zoom;
          if (pointIndex === 0) context.moveTo(screenX, screenY);
          else context.lineTo(screenX, screenY);
        });

        context.stroke();
      });
    };

    const tick = () => {
      time += 0.03;
      draw();
      frame = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });
    observer.observe(canvas);
    resize();

    fetch(WAVE_SVG_PATH)
      .then((response) => response.text())
      .then((markup) => {
        if (disposed) return;

        const parsed = new DOMParser().parseFromString(markup, "image/svg+xml");
        const svg = parsed.documentElement as unknown as SVGSVGElement;
        const stage = document.createElement("div");
        stage.setAttribute("aria-hidden", "true");
        stage.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
        stage.appendChild(svg);
        document.body.appendChild(stage);

        lines = Array.from(svg.querySelectorAll("path")).map((path) => {
          const length = path.getTotalLength();
          const points = Array.from({ length: WAVE_SAMPLES + 1 }, (_, step) => {
            const point = path.getPointAtLength((length * step) / WAVE_SAMPLES);
            return { x: point.x, y: point.y };
          });
          const declared = Number(path.getAttribute("opacity"));
          return { points, opacity: Number.isFinite(declared) && declared > 0 ? declared : 1 };
        });

        stage.remove();
        draw();

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          frame = requestAnimationFrame(tick);
        }
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={`wave-field ${className}`} aria-hidden="true" />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const impactRef = useRef<HTMLDivElement>(null);
  const [impactVisible, setImpactVisible] = useState(false);

  useEffect(() => {
    const impactNode = impactRef.current;
    if (!impactNode || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setImpactVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImpactVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.24 },
    );

    observer.observe(impactNode);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > 28);
      // FV内はヒーロー自身のCTAが見えているため、追従ボタンはヒーローを過ぎてから出す。
      setPastHero(window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className={`site-shell ${pastHero ? "is-past-hero" : ""}`}>
      <header className={`site-header site-header--light ${headerScrolled ? "is-scrolled" : ""}`}>
        <a href="#top" className="brand" aria-label="カネモト AI伴走支援 トップへ" onClick={closeMenu}>
          <BrandMark />
          <span className="brand__type">
            <strong>カネモト</strong>
            <small>AI SUPPORT</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="メインナビゲーション">
          <a href="#metrics">成果の見方</a>
          <a href="#program">支援内容</a>
          <a href="#flow">進め方</a>
        </nav>

        <a className="header-cta cta-focus cta-focus--line" href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer" onClick={() => trackCtaClick("line_register_click", "header")}>
          <MessageCircle size={17} strokeWidth={2.2} />
          <span>LINEで相談</span>
          <ArrowUpRight size={16} />
        </a>

        <button className="mobile-menu-button" type="button" aria-label="メニューを開く" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {menuOpen && (
          <div className="mobile-menu" aria-label="モバイルメニュー">
            <a href="#metrics" onClick={closeMenu}>成果の見方</a>
            <a href="#program" onClick={closeMenu}>支援内容</a>
            <a href="#flow" onClick={closeMenu}>進め方</a>
            <a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer" className="mobile-menu__line" onClick={() => { trackCtaClick("line_register_click", "mobile_menu"); closeMenu(); }}>
              公式LINEで相談する <ArrowUpRight size={17} />
            </a>
          </div>
        )}
      </header>

      <main id="top">
        <section className="hero hero--fv">
          <WaveField className="wave-field--hero" />
          <div className="content-frame hero__inner">
            <p className="hero__eyebrow">CIVIL AI LAB — AI SUPPORT PROGRAM</p>
            <h1 className="hero__heading">
              <span>土木AI研究所が、</span>
              <span>現場の仕事を</span>
              <span>AIで軽くする。</span>
            </h1>
            <p className="hero__lead">
              見積・書類・写真整理から、いま一番手間な仕事を一つ。
              <br />
              実務で使える形まで、カネモトが伴走します。
            </p>
            <div className="hero__actions">
              <a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer" className="button button--line" onClick={() => trackCtaClick("line_register_click", "hero")}>
                <MessageCircle size={18} />
                無料のチェックシートを受け取る
                <ArrowRight size={18} />
              </a>
              <a href="#gift" className="hero__text-link">チェックシートの中身を見る</a>
            </div>
            <p className="hero__reply">
              <span>登録特典</span>
              <b>AI業務棚卸しチェックシート</b>（A4・記入式）を、LINE登録後すぐにお届けします。費用はかかりません。
            </p>
          </div>
          <div className="hero__proof" aria-label="カネモトの支援基盤">
            <div className="content-frame hero__proof-inner">
              <span><b>1955</b>創業</span>
              <span><b>建設・ICT・DX</b>の現場知見</span>
              <span><b>代表が伴走</b>する実務支援</span>
            </div>
          </div>
        </section>

        <section className="issue" id="started">
          <div className="content-frame issue__layout">
            <div className="issue__statement">
              <div className="section-label"><span>02</span> WHERE WE STARTED</div>
              <p className="issue__kicker">「AIって、うちの仕事でも使えるんかな？」<br />最初にそう思ったのは、僕たち自身でした。</p>
              <h2>僕たちも、<br /><em>宮崎で現場と事務所を回す<br />25人の会社です。</em></h2>
              <figure className="issue__portrait">
                <img src="/assets/kanemoto-president-junichi.png" alt="株式会社カネモト 代表取締役 金本純一" />
                <figcaption>
                  <span>REPRESENTATIVE DIRECTOR</span>
                  <strong>金本 純一</strong>
                </figcaption>
              </figure>
            </div>
            <div className="issue__cards">
              <article><span>01</span><p><b>現場が終わってから、また書類。</b><br />見積・施工計画書・写真台帳。やることは多いのに、時間だけは増やせませんでした。</p></article>
              <article><span>02</span><p><b>AIは、正直ちょっと遠かった。</b><br />専門の人がいない自分たちに、本当に使えるのか。最初はそう思っていました。</p></article>
              <article><span>03</span><p><b>だから、書類の下書きから試した。</b><br />少しずつ「これなら現場にも持ち帰れる」が見えてきました。</p></article>
              <p className="issue__closing">僕たち自身が手探りだったから、最初に試す仕事を一緒に決め、現場と事務所に持ち帰れる形に整えます。</p>
            </div>
          </div>
        </section>

        <section className="gift" id="gift">
          <div className="content-frame gift__layout">
            <div className="gift__copy">
              <p className="eyebrow"><span>03</span> FREE CHECKLIST</p>
              <h2>まず、<em>うちの仕事のどこが<br />AIに置き換わるか</em>だけ<br />見てください。</h2>
              <p>公式LINEに登録すると、現場と事務の作業を洗い出して、AIに任せられる順番が分かるチェックシートをお送りします。相談しなくても、これだけで社内の話は進みます。</p>
              <div className="gift__reassurance">
                <div><ShieldCheck size={17} /><span>しつこい営業はしません</span></div>
                <div><Clock3 size={17} /><span>返信は1営業日以内。担当者がお答えします</span></div>
                <div><MessageCircle size={17} /><span>ブロック・解除はいつでも自由です</span></div>
              </div>
              <a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer" className="button button--line" onClick={() => trackCtaClick("line_register_click", "gift")}><MessageCircle size={18} />無料のチェックシートを受け取る<ArrowRight size={18} /></a>
              <p className="gift__note">登録後すぐにお届けします。費用は一切かかりません。</p>
            </div>
            <div className="gift__card">
              <div className="gift__card-head">
                <i><Download size={18} /></i>
                <div><span>DOWNLOAD</span><b>AI業務棚卸しチェックシート</b></div>
                <em>A4／記入式</em>
              </div>
              <ul className="gift__list">
                <li><Check size={15} />見積・積算まわりの作業を洗い出す設問</li>
                <li><Check size={15} />書類・写真・報告にかかる時間を書き出す欄</li>
                <li><Check size={15} />AIに任せやすい順に3段階で判定する評価表</li>
                <li><Check size={15} />最初に試す業務を1つに絞る優先度シート</li>
                <li><Check size={15} />そのまま使える、AIへの依頼文の例</li>
              </ul>
              <p className="gift__card-foot">記入したまま、社内会議の資料として使えます。</p>
            </div>
          </div>
        </section>

        <section className="civil-cases section-rail" id="civil-cases">
          <div className="content-frame">
            <div className="civil-cases__head">
              <div>
                <p className="eyebrow"><span>04</span> CIVIL WORK × AI</p>
                <h2>土木の仕事で、<br /><em>まず試せること。</em></h2>
              </div>
              <p>いきなり大きく変える必要はありません。<br />書類・写真・見積のうち、いま一番手間な作業を一つ選べば十分です。</p>
            </div>
            <div className="civil-cases__grid">
              <article className="civil-case-card">
                <div className="civil-case-card__top"><span>CASE 01</span><i><FileText size={22} /></i></div>
                <h3>施工計画書の<br />たたき台をつくる</h3>
                <p>図面・仕様書を読み、目次、注意点、必要な情報を整理。最初の下書きづくりからAIに任せます。</p>
                <div className="civil-case-card__result"><b>業界公開事例（別会社）</b><span>施工計画書の<br /><strong>初稿作成を短縮</strong></span></div>
                <a href="https://log-port.com/case/ai-civil-engineering-chatgpt-case-study-dx/" target="_blank" rel="noreferrer">公開事例を見る <ArrowUpRight size={15} /></a>
              </article>
              <article className="civil-case-card civil-case-card--blue">
                <div className="civil-case-card__top"><span>CASE 02</span><i><Camera size={22} /></i></div>
                <h3>工事写真を<br />整理・台帳化する</h3>
                <p>黒板の情報を読み、工種・部位・日付で写真を分類。写真帳の下書きや、撮り漏れ確認を助けます。</p>
                <div className="civil-case-card__result"><b>業界公開情報（別会社）</b><span>写真整理に<br /><strong>月20〜40時間</strong>の課題例</span></div>
                <a href="https://prtimes.jp/main/html/rd/p/000000061.000058841.html" target="_blank" rel="noreferrer">公開事例を見る <ArrowUpRight size={15} /></a>
              </article>
              <article className="civil-case-card">
                <div className="civil-case-card__top"><span>CASE 03</span><i><Calculator size={22} /></i></div>
                <h3>見積の下書きを<br />速く、迷わずつくる</h3>
                <p>過去案件の内容を探し、必要な項目や文面を拾い出す。見積を「ゼロから書く」時間を減らします。</p>
                <div className="civil-case-card__result"><b>当社支援事例（対象1社）</b><span>対象業務の見積作成時間を<br /><strong>50%以上短縮</strong></span></div>
                <a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer" onClick={() => trackCtaClick("line_register_click", "civil_case_estimate")}>うちの見積なら、どこから試す？ <ArrowRight size={15} /></a>
              </article>
            </div>
            <div className="civil-cases__foot"><p>※ CASE 01・02は他社が公開する業界事例であり、カネモトの支援実績ではありません。CASE 03は対象1社・対象業務での計測結果で、同様の成果を保証するものではありません。</p><a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer" className="underlined-link" onClick={() => trackCtaClick("line_register_click", "civil_cases")}>チェックシートで、うちの業務を洗い出す <ArrowRight size={17} /></a></div>
          </div>
        </section>

        <section className="metrics section-rail" id="metrics">
          <div className="content-frame metrics__layout">
            <div className="metrics__copy">
              <p className="eyebrow"><span>05</span> PERFORMANCE INDEX <i className="direction-mark" /></p>
              <h2>使ってみると、<br /><em>仕事の変化</em>が<br />見えてくる。</h2>
              <p>
                「便利だった」で終わらせず、仕事の変化を数字でも確かめます。現場の時間がどれだけ戻ったか、外に出していた仕事をどこまで社内で回せるようになったか。小さな一歩が、次の改善につながります。
              </p>
              <a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer" className="underlined-link" onClick={() => trackCtaClick("line_register_click", "metrics")}>計測条件をLINEで確認する <ArrowRight size={17} /></a>
            </div>
            <div ref={impactRef} className={`impact-dashboard ${impactVisible ? "is-visible" : ""}`} aria-label="AI活用による成果指標の例">
              <div className="impact-dashboard__head"><span>SUPPORT CASE / CONDITIONS DISCLOSED</span><BarChart3 size={18} /></div>
              <div className="impact-summary-card">
                <div className="impact-summary-card__lead"><span>対象1社・対象業務での支援事例</span><b>数字は、実際に仕事で使った結果です。</b></div>
                <div className="impact-summary-card__grid">
                  <article><span>01 / OUTSOURCING COST</span><strong><small>約</small>200<em>万円</em></strong><b>資料作成等の外注費を削減</b><p>対象業務の比較結果</p></article>
                  <article><span>02 / ESTIMATE TIME</span><strong>50<em>%以上</em></strong><b>見積作成時間を短縮</b><p>導入前を100とした時間指数</p></article>
                </div>
                <p className="impact-summary-card__note">※対象1社・対象業務での結果です。体制、導入期間、AIツール、算定方法により異なり、同様の成果を保証するものではありません。計測条件はLINEでご確認ください。</p>
              </div>
            </div>
          </div>
        </section>

        <section className="initial-line section-rail" id="line-consult">
          <div className="content-frame initial-line__layout">
            <div className="initial-line__copy">
              <p className="eyebrow"><span>06</span> FIRST LINE CONSULT <i className="direction-mark" /></p>
              <h2>そのあと相談すれば、<br /><em>ここまで決まる。</em></h2>
              <p>チェックシートを見て気になった作業を、一言だけ送ってください。LINEのやり取りと、必要なら15分の相談で、最初の一歩を具体的にします。ここまですべて無料です。</p>
              <a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer" className="button button--line" onClick={() => trackCtaClick("line_register_click", "first_line_consult")}><MessageCircle size={18} />チェックシートを受け取って相談する<ArrowRight size={18} /></a>
            </div>
            <div className="initial-line__decisions" aria-label="初回LINE相談で決まること">
              <article><span>01</span><div><b>最初に試す仕事</b><p>出面集計・見積・写真整理など、いま一番手間な作業を一つに絞ります。</p></div></article>
              <article><span>02</span><div><b>合う支援の形と費用感</b><p>単発講習、4週間伴走、継続支援のどれが合うか。人数や対象業務に合わせた料金目安を整理します。</p></div></article>
              <article><span>03</span><div><b>最初に準備するもの</b><p>日報・過去見積・工事写真など、あれば役立つ資料を確認します。なくても相談から始められます。</p></div></article>
              <p className="initial-line__note">相談だけで支援を決める必要はありません。まず、できそうな一歩があるかを一緒に見ます。</p>
            </div>
          </div>
        </section>

        <section className="flow section-rail" id="flow">
          <div className="content-frame">
            <div className="section-head">
              <p className="eyebrow eyebrow--light"><span>07</span> STARTING FLOW <i className="direction-mark" /></p>
              <h2>受け取るところから、<br />「できた」が増えるところまで。</h2>
            </div>
            <div className="flow__steps">
              <article><div className="flow__icon"><Download size={23} /></div><span>STEP 01</span><h3>チェックシートを受け取る</h3><p>LINEに登録すると、すぐに届きます。ここで終わっても構いません。費用はかかりません。</p></article>
              <article><div className="flow__icon"><MessageCircle size={23} /></div><span>STEP 02</span><h3>気になる作業を一言送る</h3><p>「出面集計が大変」など、一言で十分です。まず試せるやり方をお返しします。</p></article>
              <article><div className="flow__icon"><CalendarClock size={23} /></div><span>STEP 03</span><h3>15分で進め方と費用感を整理する</h3><p>必要な場合だけ。最初に試す業務、講習の形、料金目安を一緒に整理します。</p></article>
              <article><div className="flow__icon"><ClipboardCheck size={23} /></div><span>STEP 04</span><h3>実際の仕事で使ってみる</h3><p>講習・伴走で日々の実務を動かし、「できた」を次の業務へ広げます。</p></article>
            </div>
          </div>
        </section>

        <section className="program section-rail" id="program">
          <div className="content-frame program__layout">
            <div className="program__intro">
              <p className="eyebrow eyebrow--light"><span>08</span> KANEMOTO CIVIL AI PROGRAM</p>
              <h2>必要になったら、<br /><em>土木AI<br />支援プログラム。</em></h2>
              <p>チェックシートとLINE相談は無料です。そのうえで社内に定着させたくなったときだけ、下の3つから選べます。AIに詳しくなくても、今の段階に合う始め方があります。</p>
              <a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer" className="button button--line" onClick={() => trackCtaClick("line_register_click", "civil_ai_program")}><MessageCircle size={18} />まずは無料のチェックシートから<ArrowRight size={18} /></a>
            </div>
            <div className="program__options" aria-label="支援プログラムの選択肢">
              <article className="program__option-card">
                <div className="program__option-head"><i><BookOpenCheck size={19} /></i><span>ONE-OFF SESSION</span><h3>単発講習</h3><p>まず一度、AIを現場の仕事で試してみたい会社へ。</p></div>
                <div className="program__option-rows"><div><span>対象</span><b>AIをほとんど使ったことがない／社内の入口をつくりたい</b></div><div><span>進め方</span><b>90分〜2時間の実務講習。少人数でも対応</b></div></div>
                <div className="program__option-price"><span>料金目安</span><b>5万円〜／回 <small>参加人数・内容により変動</small></b></div>
                <div className="program__option-outcome"><BadgeCheck size={17} /><span><small>持ち帰るもの</small><b>まず試す業務と、その日の依頼文</b></span></div>
              </article>
              <article className="program__option-card program__option-card--featured">
                <div className="program__option-head"><i><Clock3 size={19} /></i><span>4-WEEK ACCOMPANIMENT</span><h3>4週間伴走</h3><p>一つの仕事を、実務で使える形まで整えたい会社へ。</p></div>
                <div className="program__option-rows"><div><span>対象</span><b>見積・書類・写真整理を仕事で定着させたい</b></div><div><span>進め方</span><b>テーマ選定 → 実務検証 → 使い方を整える</b></div></div>
                <div className="program__option-price"><span>料金目安</span><b>20万円〜／4週間 <small>対象業務・訪問回数により変動</small></b></div>
                <div className="program__option-outcome"><BadgeCheck size={17} /><span><small>持ち帰るもの</small><b>貴社用の使い方・業務フロー・確認指標</b></span></div>
              </article>
              <article className="program__option-card">
                <div className="program__option-head"><i><MessageCircle size={19} /></i><span>CONTINUOUS SUPPORT</span><h3>継続支援</h3><p>AIを社内に広げ、少しずつ改善を続けたい会社へ。</p></div>
                <div className="program__option-rows"><div><span>対象</span><b>複数の業務・担当者へ少しずつ広げたい</b></div><div><span>進め方</span><b>月次定例とLINE伴走で、改善を積み重ねる</b></div></div>
                <div className="program__option-price"><span>料金目安</span><b>10万円〜／月 <small>対象業務・相談頻度により変動</small></b></div>
                <div className="program__option-outcome"><BadgeCheck size={17} /><span><small>持ち帰るもの</small><b>毎月の改善テーマと、社内で続ける仕組み</b></span></div>
              </article>
            </div>
          </div>
        </section>

        <section className="final-cta section-rail">
          <div className="final-cta__image" aria-hidden="true" />
          <WaveField className="wave-field--final" />
          <div className="content-frame final-cta__content">
            <p className="eyebrow eyebrow--light"><span>09</span> NEXT STEP <i className="direction-mark" /></p>
            <h2>まず、<br /><em>無料のチェックシート<br />から。</em></h2>
            <p>登録すると、AI業務棚卸しチェックシートがすぐ届きます。<br />そのまま読むだけでも構いません。相談したくなったら、一言送ってください。</p>
            <div className="line-reply-preview" aria-label="LINEで届く返信例">
              <div className="line-reply-preview__head"><MessageCircle size={18} /><span>LINEで届く、最初の返信例</span></div>
              <p className="line-reply-preview__user">出面集計に困っている</p>
              <div className="line-reply-preview__answer"><span>カネモトからのご提案</span><b>まずは「日報から出面表をつくる」から試しましょう。</b><p>日報をもとに、必要な項目の整理と出面表の下書きをつくる方法です。最初に使う依頼文もお送りします。</p></div>
            </div>
            <div className="final-cta__actions">
              <a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer" className="button button--line" onClick={() => trackCtaClick("line_register_click", "final_cta")}><MessageCircle size={18} />無料のチェックシートを受け取る<ArrowRight size={18} /></a>
            </div>
            <p className="final-cta__reassurance"><ShieldCheck size={15} />しつこい営業はしません／返信は1営業日以内／ブロックはいつでも自由</p>
          </div>
        </section>

      </main>

      <footer className="site-footer">
        <div className="content-frame site-footer__row">
          <div className="brand brand--footer"><BrandMark inverse /><span className="brand__type"><strong>カネモト</strong><small>AI SUPPORT</small></span></div>
          <p>AIを、現場の仕事にする。</p>
          <span>© KANEMOTOGUMI</span>
        </div>
      </footer>
      <a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer" className="floating-line" onClick={() => trackCtaClick("line_register_click", "floating_button")} aria-label="公式LINEに登録して無料チェックシートを受け取る">
        <MessageCircle size={20} />
        <span className="floating-line__label">無料チェックシートを受け取る</span>
      </a>
    </div>
  );
}
