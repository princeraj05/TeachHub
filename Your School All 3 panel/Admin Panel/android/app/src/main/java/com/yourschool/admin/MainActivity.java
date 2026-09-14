package com.yourschool.admin;

import android.app.DownloadManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.URLUtil;
import android.webkit.WebView;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Attach Native Download Manager & Base64 File Storage Listener to Admin Capacitor WebView
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();

            webView.setDownloadListener(new DownloadListener() {
                @Override
                public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                    try {
                        if (url != null && url.startsWith("data:")) {
                            handleBase64DataDownload(url, contentDisposition, mimeType);
                            return;
                        }

                        // System DownloadManager for HTTP/HTTPS URLs
                        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                        String safeMimeType = (mimeType != null && !mimeType.isEmpty()) ? mimeType : "application/pdf";
                        request.setMimeType(safeMimeType);

                        String cookies = CookieManager.getInstance().getCookie(url);
                        if (cookies != null) {
                            request.addRequestHeader("cookie", cookies);
                        }
                        if (userAgent != null) {
                            request.addRequestHeader("User-Agent", userAgent);
                        }
                        request.setDescription("Downloading file from Admin Panel...");

                        String fileName = URLUtil.guessFileName(url, contentDisposition, safeMimeType);
                        if (fileName == null || fileName.isEmpty()) {
                            fileName = "admin_report.pdf";
                        }
                        fileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");

                        request.setTitle(fileName);
                        request.allowScanningByMediaScanner();
                        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);

                        DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                        if (dm != null) {
                            dm.enqueue(request);
                            Toast.makeText(getApplicationContext(), "Downloading File: " + fileName, Toast.LENGTH_SHORT).show();
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        Toast.makeText(getApplicationContext(), "Download Failed", Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }
    }

    private void handleBase64DataDownload(String dataUrl, String contentDisposition, String mimeType) {
        try {
            int commaIndex = dataUrl.indexOf(",");
            if (commaIndex == -1) return;

            String header = dataUrl.substring(0, commaIndex);
            String base64Data = dataUrl.substring(commaIndex + 1);

            byte[] pdfAsBytes = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT);

            String detectedMime = mimeType;
            if (detectedMime == null || detectedMime.isEmpty() || detectedMime.equals("text/plain")) {
                if (header.contains("application/pdf")) detectedMime = "application/pdf";
                else if (header.contains("image/png")) detectedMime = "image/png";
                else if (header.contains("image/jpeg")) detectedMime = "image/jpeg";
                else if (header.contains("text/csv")) detectedMime = "text/csv";
                else detectedMime = "application/pdf";
            }

            String extension = ".pdf";
            if (detectedMime.contains("png")) extension = ".png";
            else if (detectedMime.contains("jpeg") || detectedMime.contains("jpg")) extension = ".jpg";
            else if (detectedMime.contains("csv")) extension = ".csv";
            else if (detectedMime.contains("excel") || detectedMime.contains("spreadsheet")) extension = ".xlsx";

            String fileName = "Admin_Doc_" + System.currentTimeMillis() + extension;
            fileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");

            File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            File file = new File(downloadsDir, fileName);

            FileOutputStream os = new FileOutputStream(file, false);
            os.write(pdfAsBytes);
            os.flush();
            os.close();

            // Notify MediaScanner
            android.media.MediaScannerConnection.scanFile(this, new String[]{file.getAbsolutePath()}, new String[]{detectedMime}, null);

            Toast.makeText(getApplicationContext(), "Saved to Downloads: " + fileName, Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(getApplicationContext(), "Failed to save file", Toast.LENGTH_SHORT).show();
        }
    }
}
