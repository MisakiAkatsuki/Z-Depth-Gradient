/*
  Z Depth Gradient
    (C) あかつきみさき(みくちぃP)

  このスクリプトについて
    レイヤーにカメラ距離に応じたデプスのグラデーションを適用します.

  使用方法
    スクリプトファイルの実行より実行してください.

  動作環境
    Adobe After Effects CS6以上

  バージョン情報
    2016/07/21 Ver 1.0.0 Release
 */

/// <reference path="C:/Users/RUI/OneDrive/lib/aftereffects.d.ts/ae.d.ts"/>

(() => {
  enum AE_Version {
    CS3 = 8.0,
    CS4,
    CS5,
    CS5_5 = 10.5,
    CS6 = 11.0,
    CC,
    CC2014,
    CC2015 = 13.5,
    CC2015_3 = 13.8,
  }

  class AK_Utils {
    static isSupportedVersion(version: AE_Version): boolean {
      return (parseFloat(app.version) >= version);
    }

    static getActiveComp(): CompItem {
      const item: Item = app.project.activeItem;

      if (item && item instanceof CompItem) {
        return <CompItem>item;
      }

      return null;
    }

    static getSelectedAVLayer(comp: CompItem): AVLayer[] {
      let layer: AVLayer[] = [];

      for (let i = 0; i < comp.selectedLayers.length; i++) {
        if (comp.selectedLayers[i] instanceof AVLayer) {
          layer[layer.length] = (<AVLayer>comp.selectedLayers[i]);
        }
      }

      return layer;
    }
  }


  const ADBE_Effect_Parade: string = "ADBE Effect Parade";
  const ADBE_4ColorGradient: string = "ADBE 4ColorGradient";
  const ADBE_Slider_Control: string = "ADBE Slider Control";
  const ADBE_Slider_Control_0001: string = "ADBE Slider Control-0001";
  const DEFAULT_FAR_VALUE: number = 5000;

  const supportVersion: AE_Version = AE_Version.CS6;
  if (!AK_Utils.isSupportedVersion(supportVersion)) {
    return 0;
  }

  const actComp: CompItem = AK_Utils.getActiveComp();
  if (actComp == null) {
    return 0;
  }

  app.beginUndoGroup("Z depth Gradient");
  let selLayers: AVLayer[] = AK_Utils.getSelectedAVLayer(actComp);
  if (selLayers.length == 0) {
    selLayers[0] = actComp.layers.addSolid([0, 0, 0], "Z depth", actComp.width, actComp.height, 1.0, actComp.duration);
  }

  let actCamera: CameraLayer = actComp.activeCamera;
  if (actCamera == null) {
    actCamera = actComp.layers.addCamera("Camera", [actComp.width / 2, actComp.height / 2]);
  }

  let gradientEffect: PropertyBase;
  let sliderEffect: PropertyBase;

  for (let i = 0; i < selLayers.length; i++) {
    selLayers[i].threeDLayer = true;
    selLayers[i].autoOrient = AutoOrientType.CAMERA_OR_POINT_OF_INTEREST;

    sliderEffect = selLayers[i].property(ADBE_Effect_Parade).addProperty(ADBE_Slider_Control);
    sliderEffect.property(ADBE_Slider_Control_0001).setValue(DEFAULT_FAR_VALUE);

    gradientEffect = selLayers[i].property(ADBE_Effect_Parade).addProperty(ADBE_4ColorGradient);

    // addPropertyで参照が外れるので再取得
    sliderEffect = selLayers[i].property(ADBE_Effect_Parade).property(gradientEffect.propertyIndex - 1);
    sliderEffect.name = 'Far (' + sliderEffect.name + ')';

    selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0001").expression = "[0,0]";
    selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0002").expression = 'far = effect("' + sliderEffect.name + '")("' + ADBE_Slider_Control_0001 + '");\ncamera = thisComp.activeCamera;\ncameraPosition = camera.toWorld([0,0,0]);\npoint = effect("' + gradientEffect.name + '")("ADBE 4ColorGradient-0001");\nposition = thisLayer.toWorld(point);\nd = length(cameraPosition, position);\nf = linear(d, 0, far, 1, 0);\n[f,f,f,1]';

    selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0003").expression = "[thisLayer.width,0]";
    selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0004").expression = 'far = effect("' + sliderEffect.name + '")("' + ADBE_Slider_Control_0001 + '");\ncamera = thisComp.activeCamera;\ncameraPosition = camera.toWorld([0,0,0]);\npoint = effect("' + gradientEffect.name + '")("ADBE 4ColorGradient-0003");\nposition = thisLayer.toWorld(point);\nd = length(cameraPosition, position);\nf = linear(d, 0, far, 1, 0);\n[f,f,f,1]';

    selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0005").expression = "[0,thisLayer.height]";
    selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0006").expression = 'far = effect("' + sliderEffect.name + '")("' + ADBE_Slider_Control_0001 + '");\ncamera = thisComp.activeCamera;\ncameraPosition = camera.toWorld([0,0,0]);\npoint = effect("' + gradientEffect.name + '")("ADBE 4ColorGradient-0005");\nposition = thisLayer.toWorld(point);\nd = length(cameraPosition, position);\nf = linear(d, 0, far, 1, 0);\n[f,f,f,1]';

    selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0007").expression = "[thisLayer.width,thisLayer.height]";
    selLayers[i].property(ADBE_Effect_Parade).property(ADBE_4ColorGradient).property("ADBE 4ColorGradient-0008").expression = 'far = effect("' + sliderEffect.name + '")("' + ADBE_Slider_Control_0001 + '");\ncamera = thisComp.activeCamera;\ncameraPosition = camera.toWorld([0,0,0]);\npoint = effect("' + gradientEffect.name + '")("ADBE 4ColorGradient-0005");\nposition = thisLayer.toWorld(point);\nd = length(cameraPosition, position);\nf = linear(d, 0, far, 1, 0);\n[f,f,f,1]';
  }

  app.endUndoGroup();

})();
